// @flow
import del from 'del';
import im from 'imagemagick';
import { getFullResult } from 'image-diff';
import R, { pipe, always, is } from 'ramda';
import { returnPromiseAll } from 'utils/functional';
import { scanDirWithKey, getTextFile, putFile, exists, stat } from 'utils/file';
import { hash } from 'utils/crypt';
import { postMessage } from 'domains/Slack';
import { downloadDirFromS3 } from 'utils/s3';
import type { SlackIncoming, MessageResponce } from 'domains/Slack';

type Uri = string;
type Path = string;
type PathFilters = any;
type Percent = number;
type Message = string;
type BuildProgressCallback = (Percent, Message) => any;
type ImageProgressCallback = Message => any;

const defaultThreshold = 0.005; // %
const waitAcceptedMinutes = 10;
const checkFinishCountLimit = 60; // 5 min
const checkFinishDeltaMsec = 5000;

export type ImageWithoutDiffParam = {
  actualImage: Path,
  expectedImage: Path,
};

export type ImageDiffParam = ImageWithoutDiffParam & {
  diffImage: Path,
};

export type ImageDiff = {
  total: number,
  percentage: number,
  path?: Path,
};

export type S3Param = {
  accessKeyId: string,
  secretAccessKey: string,
  bucketName: string,
};

export type BuildParam = {
  expectPath: string,
  actualPath: string,
  threshold: number,
  pathFilters?: string[],
};

export type ImageDiffResult = {
  newImages: Path[],
  delImages: Path[],
  maxPercentage: number,
  avgPercentage: number,
  diffCount: number,
  images: ImageDiff[],
  threshold: number,
};

export type WorkLocation = {
  hashed: string,
  dirpath: Path,
  actualDirPath: Path,
  expectDirPath: Path,
  diffDirPath: Path,
  resultJsonPath: Path,
  touchFilePath: Path,
}

export const getWorkLocation:
  Path => BuildParam => WorkLocation
= workDirPath => buildParam => {
  const hashed = hash(buildParam);
  const dirpath = `${workDirPath}/${hashed}`;
  return {
    hashed,
    dirpath,
    actualDirPath: `${dirpath}/actual`,
    expectDirPath: `${dirpath}/expect`,
    diffDirPath: `${dirpath}/diff`,
    resultJsonPath: `${dirpath}/index.json`,
    touchFilePath: `${dirpath}/building.now`,
  };
};

export const extractBuildParam:
  Object => BuildParam
= x => ({
  expectPath: x.expectPath,
  actualPath: x.actualPath,
  threshold: Number(x.threshold || defaultThreshold),
  pathFilters: x.pathFilters ? R.flatten([x.pathFilters]) : [],
});

export const createPathFilter:
  PathFilters => Path => boolean
= R.cond([
  [is(Array),
    pipe(
      R.map(x => y => new RegExp(x).test(y)),
      R.reduce((acc, x) => y => acc(y) && x(y), R.T),
    ),
  ],
  [is(String),
    x => y => new RegExp(x).test(y),
  ],
  [R.T,
    () => always(true),
  ],
]);

export const createImageDiff:
  ImageDiffParam => Promise<ImageDiff>
= param => new Promise((resolve, reject) => {
  getFullResult(param, (err, result) => (err ? reject(err) : resolve(result)));
});

export const createImageDiffByDir:
  (ImageDiffParam, ImageProgressCallback | void) => Promise<ImageDiff[]>
= async ({ actualImage, expectedImage, diffImage }, progress) => {
  if (!(await exists(actualImage) && exists(await expectedImage))) {
    throw new Error('not found images for diff');
  }
  const imageMap1 = await scanDirWithKey(actualImage);
  const imageMap2 = await scanDirWithKey(expectedImage);
  const mapIndexed: any = R.addIndex(R.map);
  const pathes = pipe(
    R.keys,
    R.filter(x => imageMap1[x] && imageMap2[x]),
  )(imageMap1);
  return pipe(
    mapIndexed(async (x, i) => {
      if (progress) progress(`(${i}/${pathes.length}) ${x}`);
      const result = await createImageDiff({
        actualImage: imageMap1[x],
        expectedImage: imageMap2[x],
        diffImage: `${diffImage}${x}`,
      });
      return { ...result, path: x };
    }),
    returnPromiseAll,
  )(pathes);
};

export const composeImageDiff:
  ImageDiffParam => Promise<void>
= ({ actualImage, diffImage }) => new Promise((resolve, reject) => im.convert(
  [
    actualImage,
    diffImage,
    '-gravity',
    'southeast',
    '-compose',
    'over',
    '-composite',
    diffImage,
  ],
  err => (err ? reject(err) : resolve()),
));

export const composeImageDiffByDir:
  ImageDiffParam => Promise<void>
= async ({ actualImage, diffImage }) => {
  const imageMap1 = await scanDirWithKey(diffImage);
  const imageMap2 = await scanDirWithKey(actualImage);
  return pipe(
    R.keys,
    R.map(x => composeImageDiff({
      diffImage: imageMap1[x],
      actualImage: imageMap2[x],
      expectedImage: '',
    })),
    returnPromiseAll,
  )(imageMap1);
};

export const getNewImagePathes:
  ImageWithoutDiffParam => Promise<Path[]>
= async ({ actualImage, expectedImage }) => {
  const imageMap1 = await scanDirWithKey(actualImage);
  const imageMap2 = await scanDirWithKey(expectedImage);
  return pipe(
    R.keys,
    R.filter(x => imageMap1[x] && !imageMap2[x]),
  )(imageMap1);
};

export const getDelImagePathes:
  ImageWithoutDiffParam => Promise<Path[]>
= async ({ actualImage, expectedImage }) => {
  const imageMap1 = await scanDirWithKey(actualImage);
  const imageMap2 = await scanDirWithKey(expectedImage);
  return pipe(
    R.keys,
    R.filter(x => !imageMap1[x] && imageMap2[x]),
  )(imageMap2);
};

const countManyDiff:
  ImageDiffResult => number
= x => x.images.filter(y => y.percentage > x.threshold).length;

const countLessDiff:
  ImageDiffResult => number
= x => x.images.filter(y => y.percentage <= x.threshold && y.percentage > 0).length;

export const postFinishMessage:
  SlackIncoming => (ImageDiffResult, Uri) => Promise<MessageResponce>
= slackIncoming => (result, uri) => postMessage(slackIncoming)({
  attachments: [{
    fallback: 'Finish building images',
    color: result.maxPercentage > result.threshold ? '#cc0000' : '#36a64f',
    fields: [
      {
        title: 'Max Percentage',
        value: `${result.maxPercentage} %`,
        short: true,
      },
      {
        title: 'New / Delete Images',
        value: `${result.newImages.length} / ${result.delImages.length}`,
        short: true,
      },
      {
        title: 'Error / Less Difference Images',
        value: `${countManyDiff(result)} / ${countLessDiff(result)}`,
        short: true,
      },
      {
        title: 'Build URL',
        value: `<${uri}|View Image Diff Detail>`,
        short: true,
      },
    ],
    footer: 'Finish building image diff',
    ts: Math.floor(new Date().getTime() / 1000),
  }],
});

export const postErrorMessage:
  SlackIncoming => Error => Promise<MessageResponce>
= slackIncoming => error => postMessage(slackIncoming)({
  attachments: [{
    fallback: error.message,
    color: '#cc0000',
    fields: [
      {
        title: 'Build Error',
        value: error.message,
        short: false,
      },
    ],
    footer: 'Error building images',
    ts: Math.floor(new Date().getTime() / 1000),
  }],
});

export const isBuilding:
  Path => BuildParam => Promise<boolean>
= workDirPath => async buildParam => {
  const locate = getWorkLocation(workDirPath)(buildParam);
  if (await exists(locate.touchFilePath)) {
    const now = new Date();
    const pre = now.setMinutes(now.getMinutes() - waitAcceptedMinutes);
    if (pre < (await stat(locate.touchFilePath)).ctime) {
      return true;
    }
  }
  return false;
};

export const buildDiffImagesFromS3:
  (Path, S3Param) => (BuildParam, BuildProgressCallback | void) => Promise<ImageDiffResult>
= (workDirPath, s3Param) => async (buildParam, progress) => {
  const {
    expectPath,
    actualPath,
    threshold,
  } = buildParam;
  // const pathFilter = createPathFilter(buildParam.pathFilters);
  const locate = getWorkLocation(workDirPath)(buildParam);
  if (await isBuilding(workDirPath)(buildParam)) {
    throw new Error('already accepted');
  }
  await del(locate.dirpath, { force: true });
  await putFile(locate.touchFilePath)('');
  try {
    if (progress) progress(20, 'downloadActualArtifacts');
    await downloadDirFromS3(s3Param)({
      Bucket: s3Param.bucketName,
      Prefix: expectPath,
    }, locate.expectDirPath);
    if (progress) progress(40, 'downloadExpectArtifacts');
    await downloadDirFromS3(s3Param)({
      Bucket: s3Param.bucketName,
      Prefix: actualPath,
    }, locate.actualDirPath);
    if (progress) progress(60, 'makeDiffImages');
    const pairPath = {
      actualImage: locate.actualDirPath,
      expectedImage: locate.expectDirPath,
    };
    const images = await createImageDiffByDir({
      ...pairPath,
      diffImage: locate.diffDirPath,
    }, progressLabel => {
      if (progress) progress(60, progressLabel);
    });
    if (progress) progress(80, 'composeDiffImages');
    await composeImageDiffByDir({
      ...pairPath,
      diffImage: locate.diffDirPath,
    });
    if (progress) progress(100, 'complete');
    const result = {
      newImages: await getNewImagePathes(pairPath),
      delImages: await getDelImagePathes(pairPath),
      avgPercentage:
        pipe(
          R.map(x => x.percentage),
          R.mean,
        )(images),
      maxPercentage:
        pipe(
          R.map(x => x.percentage),
          R.reduce(R.max, 0),
        )(images),
      diffCount:
        R.filter(x => x.percentage > 0)(images).length,
      images,
      threshold,
    };
    await putFile(locate.resultJsonPath)(JSON.stringify(result));
    await del(locate.touchFilePath, { force: true });
    return result;
  } catch (err) {
    await del(locate.touchFilePath, { force: true });
    throw err;
  }
};

export const untilFinishBuilding:
  Path => BuildParam => Promise<ImageDiffResult>
= workDirPath => async buildParam => {
  /* eslint-disable */
  const locate = getWorkLocation(workDirPath)(buildParam);
  for (let i = 0; i < checkFinishCountLimit; i += 1) {
    if (await exists(locate.resultJsonPath)) {
      return await getTextFile(locate.resultJsonPath);
    }
    await new Promise(resolve => setTimeout(resolve, checkFinishDeltaMsec));
  }
  throw new Error('wait timeout');
  /* eslint-enable */
};

export const getResource:
  ImageDiffResult => Uri => Object // TODO: more strict type
= result => assetUri => ({
  ...result,
  images: result.images.map(x => ({
    ...x,
    actualImagePath: `${assetUri}/actual${x.path || ''}`,
    expectImagePath: `${assetUri}/expect${x.path || ''}`,
    diffImagePath: `${assetUri}/diff${x.path || ''}`,
  })),
  newImages: result.newImages.map(path => ({
    path,
    imagePath: `${assetUri}/actual${path}`,
  })),
  delImages: result.delImages.map(path => ({
    path,
    imagePath: `${assetUri}/expect${path}`,
  })),
});
