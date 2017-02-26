// @flow
import { getFullResult } from 'image-diff';
import { pipe, keys, map, filter } from 'ramda';
import { returnPromiseAll } from 'utils/functional';
import { scanDirWithKey } from 'utils/file';

type Path = string;

type ImageDiffParam = {
  actualImage: Path,
  expectedImage: Path,
  diffImage: Path,
};

type ImageDiffResult = {
  total: number,
  difference: number,
  path?: Path,
};

export const createImageDiff:
  ImageDiffParam => Promise<ImageDiffResult>
= param => new Promise((resolve, reject) => {
  getFullResult(param, (err, result) => (err ? reject(err) : resolve(result)));
});

export const createImageDiffByDir:
  ImageDiffParam => Promise<ImageDiffResult[]>
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
