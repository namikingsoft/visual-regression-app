// @flow
import del from 'del';
import { getFullResult } from 'image-diff';
import R, { pipe, always, is } from 'ramda';
import { andThen, returnPromiseAll } from 'utils/functional';
import { scanDirWithKey, getTextFile, putFile, exists, stat } from 'utils/file';
import { hash } from 'utils/crypt';
import {
  getArtifacts,
  saveArtifacts,
  untilDoneBuild,
  getBuildViewUri,
} from 'domains/CircleCI';
import { postMessage } from 'domains/Slack';
import type { SlackIncoming, MessageResponce } from 'domains/Slack';

type Uri = string;
type Path = string;
type PathFilters = any;

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

export type BuildIdentifier = {
  ciToken: string,
  username: string,
  reponame: string,
  actualBuildNum: number,
  expectBuildNum: number,
  threshold: number,
  pathFilters?: string[],
};

export type RequestPayload = BuildIdentifier & {
  slackIncoming?: string,
};

export type ImageDiffResult = BuildIdentifier & {
  newImages: Path[],
  delImages: Path[],
  maxPercentage: number,
  avgPercentage: number,
  diffCount: number,
  images: ImageDiff[],
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
  Path => BuildIdentifier => WorkLocation
= workDirPath => identifier => {
  const hashed = hash(identifier);
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

export const extractPayload:
  Object => RequestPayload
= x => ({
  ciToken: x.ciToken,
  username: x.username,
  reponame: x.reponame,
  actualBuildNum: x.actualBuildNum,
  expectBuildNum: x.expectBuildNum,
  slackIncoming: x.slackIncoming,
  pathFilters: x.pathFilters,
  threshold: x.threshold || defaultThreshold,
});

export const extractIdentifier:
  Object => BuildIdentifier
= x => ({
  ciToken: x.ciToken,
  username: x.username,
  reponame: x.reponame,
  actualBuildNum: x.actualBuildNum,
  expectBuildNum: x.expectBuildNum,
  pathFilters: x.pathFilters,
  threshold: x.threshold || defaultThreshold,
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
  ImageDiffParam => Promise<ImageDiff[]>
= async ({ actualImage, expectedImage, diffImage }) => {
  if (!(await exists(actualImage) && exists(await expectedImage))) {
    throw new Error('not found images for diff');
  }
  const imageMap1 = await scanDirWithKey(actualImage);
  const imageMap2 = await scanDirWithKey(expectedImage);
  return pipe(
    R.keys,
    R.filter(x => imageMap1[x] && imageMap2[x]),
    R.map(async x => ({
      ...await createImageDiff({
        actualImage: imageMap1[x],
        expectedImage: imageMap2[x],
        diffImage: `${diffImage}${x}`,
      }),
      path: x,
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

export const postStartMessage:
  SlackIncoming => BuildIdentifier => Promise<MessageResponce>
= slackIncoming => identifier => postMessage(slackIncoming)({
  attachments: [{
    fallback: 'Start building image diff ...',
    text: `
      Start building images diff ... to <${getBuildViewUri({
        username: identifier.username,
        reponame: identifier.reponame,
        buildNum: identifier.actualBuildNum,
      })}|#${identifier.actualBuildNum}> from <${getBuildViewUri({
        username: identifier.username,
        reponame: identifier.reponame,
        buildNum: identifier.expectBuildNum,
      })}|#${identifier.expectBuildNum}>
    `,
    color: '#cccccc',
    footer: 'Start building image diff',
    ts: Math.floor(new Date().getTime() / 1000),
  }],
});

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
  Path => BuildIdentifier => Promise<boolean>
= workDirPath => async identifier => {
  const locate = getWorkLocation(workDirPath)(identifier);
  if (await exists(locate.touchFilePath)) {
    const now = new Date();
    const pre = now.setMinutes(now.getMinutes() - waitAcceptedMinutes);
    if (pre < (await stat(locate.touchFilePath)).ctime) {
      return true;
    }
  }
  return false;
};

export const buildDiffImages:
  Path => BuildIdentifier => Promise<ImageDiffResult>
= workDirPath => async identifier => {
  const { ciToken, username, reponame, actualBuildNum, expectBuildNum } = identifier;
  const pathFilter = createPathFilter(identifier.pathFilters);
  const locate = getWorkLocation(workDirPath)(identifier);
  if (await isBuilding(workDirPath)(identifier)) {
    throw new Error('already accepted');
  }
  await del(locate.dirpath, { force: true });
  await putFile(locate.touchFilePath)('');
  try {
    const commonBuildParam = { vcsType: 'github', username, reponame };
    await untilDoneBuild(ciToken)({ ...commonBuildParam, buildNum: actualBuildNum });
    await untilDoneBuild(ciToken)({ ...commonBuildParam, buildNum: expectBuildNum });
    const saveFilteredArtifacts = buildNum => saveDirPath => pipe(
      getArtifacts(ciToken),
      andThen(pipe(
        R.filter(x => pathFilter(x.path)),
        saveArtifacts(ciToken)(saveDirPath),
      )),
    )({ ...commonBuildParam, buildNum });
    await saveFilteredArtifacts(actualBuildNum)(locate.actualDirPath);
    await saveFilteredArtifacts(expectBuildNum)(locate.expectDirPath);
    const pairPath = {
      actualImage: locate.actualDirPath,
      expectedImage: locate.expectDirPath,
    };
    const images = await createImageDiffByDir({
      ...pairPath,
      diffImage: locate.diffDirPath,
    });
    const result = {
      ...identifier,
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
    };
    await putFile(locate.resultJsonPath)(JSON.stringify(result));
    return result;
  } catch (err) {
    if (await exists(locate.touchFilePath)) {
      await del(locate.touchFilePath, { force: true });
    }
    throw err;
  }
};

export const untilFinishBuilding:
  Path => BuildIdentifier => Promise<ImageDiffResult>
= workDirPath => async identifier => {
  /* eslint-disable */
  const locate = getWorkLocation(workDirPath)(identifier);
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
