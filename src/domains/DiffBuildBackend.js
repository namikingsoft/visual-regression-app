// @flow
import { getFullResult } from 'image-diff';
import { pipe, keys, map, filter, cond, reduce, always, is, T } from 'ramda';
import { returnPromiseAll } from 'utils/functional';
import { scanDirWithKey } from 'utils/file';
import { hash } from 'utils/crypt';

type Path = string;
type PathFilters = any;

const defaultThreshold = 0.01; // %

export type ImageDiffParam = {
  actualImage: Path,
  expectedImage: Path,
  diffImage: Path,
};

export type ImageDiff = {
  total: number,
  percentage: number,
  path?: Path,
};

export type BuildIdentifier = {
  token: string,
  username: string,
  reponame: string,
  actualBuildNum: number,
  expectBuildNum: number,
  threshold: number,
  pathFilters: string[],
};

export type RequestPayload = BuildIdentifier & {
  slackIncoming: string,
};

export type WorkLocation = {
  hashed: string,
  dirpath: Path,
  actualDirPath: Path,
  expectDirPath: Path,
  diffDirPath: Path,
  resultJsonPath: Path
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
  };
};

export const extractPayload:
  Object => RequestPayload
= x => ({
  token: x.token,
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
  token: x.token,
  username: x.username,
  reponame: x.reponame,
  actualBuildNum: x.actualBuildNum,
  expectBuildNum: x.expectBuildNum,
  pathFilters: x.pathFilters,
  threshold: x.threshold || defaultThreshold,
});

export const createPathFilter:
  PathFilters => Path => boolean
= cond([
  [is(Array),
    pipe(
      map(x => y => new RegExp(x).test(y)),
      reduce((acc, x) => y => acc(y) && x(y), T),
    ),
  ],
  [is(String),
    x => y => new RegExp(x).test(y),
  ],
  [T,
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
  const imageMap1 = await scanDirWithKey(actualImage);
  const imageMap2 = await scanDirWithKey(expectedImage);
  return pipe(
    keys,
    filter(x => imageMap1[x] && imageMap2[x]),
    map(async x => ({
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
