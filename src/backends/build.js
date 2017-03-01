// @flow
import type { $Application } from 'express';
import del from 'del';
import { pipe, filter, identity, is, cond, always, reduce, map, T, mean, max } from 'ramda';
import { andThen } from 'utils/functional';
import { getArtifacts, saveArtifacts, untilDoneBuild } from 'domains/CircleCI';
import { postMessage } from 'domains/Slack';
import { createImageDiffByDir } from 'domains/ImageDiff';
import { encode, decode, hash } from 'utils/crypt';
import { putFile, getTextFile } from 'utils/file';
import * as env from 'env';

type Route = string;

export const build:
  Route => $Application => $Application
= route => app => (app: any)

.post(route, async (req, res) => {
  const {
    token,
    username,
    reponame,
    actualBuildNum,
    expectBuildNum,
    pathFilters,
    slackIncoming,
  } = req.body;
  const identifier = {
    token,
    username,
    reponame,
    pathFilters,
    actualBuildNum,
    expectBuildNum,
  };
  const pathFilter = cond([
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
      always(null),
    ],
  ])(pathFilters);
  const encoded = encode(env.cryptSecret)(identifier);
  const hashed = hash(identifier);
  const dirpath = `${env.workDirPath}/${hashed}`;
  const actualDirPath = `${dirpath}/actual`;
  const expectDirPath = `${dirpath}/expect`;
  const diffDirPath = `${dirpath}/diff`;
  const resultJsonPath = `${dirpath}/index.json`;
  res.status(202).send({
    ...identifier,
    token: undefined,
  });
  res.end();
  await del(dirpath, { force: true });
  // start building
  const commonBuildParam = {
    vcsType: 'github',
    username,
    project: reponame,
  };
  await untilDoneBuild(token)({ ...commonBuildParam, buildNum: actualBuildNum });
  postMessage(slackIncoming)({
    attachments: [{
      fallback: 'Start building images ...',
      pretext: 'Start building images ...',
      color: '#cccccc',
      fields: [
        {
          title: 'Actual Images',
          value: `https://circleci.com/gh/${username}/${reponame}/${actualBuildNum}`,
          short: false,
        },
        {
          title: 'Expected Images',
          value: `https://circleci.com/gh/${username}/${reponame}/${expectBuildNum}`,
          short: false,
        },
      ],
      footer: 'Start building images',
      ts: Math.floor(new Date().getTime() / 1000),
    }],
  });
  const saveFilteredArtifacts = buildNum => saveDirPath => pipe(
    getArtifacts(token),
    andThen(pipe(
      pathFilter ? filter(x => pathFilter(x.path)) : identity,
      saveArtifacts(token)(saveDirPath),
    )),
  )({ ...commonBuildParam, buildNum });
  await saveFilteredArtifacts(actualBuildNum)(actualDirPath);
  await saveFilteredArtifacts(expectBuildNum)(expectDirPath);
  const results = await createImageDiffByDir({
    actualImage: actualDirPath,
    expectedImage: expectDirPath,
    diffImage: diffDirPath,
  });
  await putFile(resultJsonPath)(JSON.stringify(results));
  const diffCount = filter(x => x.percentage > 0)(results).length;
  const maxPercentage = pipe(
    map(x => x.percentage),
    reduce(max, 0),
  )(results);
  const avgPercentage = pipe(
    map(x => x.percentage),
    mean,
  )(results);
  postMessage(slackIncoming)({
    attachments: [{
      fallback: 'Finish building images',
      color: maxPercentage > 0.01 ? '#cc0000' : '#36a64f',
      fields: [
        {
          title: 'Max Percentage',
          value: `${maxPercentage} %`,
          short: true,
        },
        {
          title: 'Avarage',
          value: `${avgPercentage} %`,
          short: true,
        },
        {
          title: 'Difference Count',
          value: String(diffCount),
          short: true,
        },
        {
          title: 'Build URL',
          value: `<${env.appUri}/builds/${encoded}|View Image Diff List>`,
          short: true,
        },
      ],
      footer: 'Finish building images',
      ts: Math.floor(new Date().getTime() / 1000),
    }],
  });
})

.get(`${route}/:encoded`, async (req, res) => {
  const { encoded } = req.params;
  const identifier = decode(env.cryptSecret)(encoded);
  const hashed = hash(identifier);
  const dirpath = `${env.workDirPath}/${hashed}`;
  const jsonPath = `${dirpath}/index.json`;
  res.send({
    ...identifier,
    images: JSON.parse(await getTextFile(jsonPath))
      .map(x => ({
        ...x,
        actualImagePath: `/assets/${hashed}/actual${x.path}`,
        expectImagePath: `/assets/${hashed}/expect${x.path}`,
        diffImagePath: `/assets/${hashed}/diff${x.path}`,
      })),
  });
});

export default build;
