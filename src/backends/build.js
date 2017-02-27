// @flow
import type { $Application } from 'express';
import del from 'del';
import { downloadArtifacts } from 'domains/CircleCI';
import { createImageDiffByDir } from 'domains/ImageDiff';
import { encode, decode, hash } from 'utils/crypt';
import { post } from 'utils/request';
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
    slackIncoming,
  } = req.body;
  const identifier = {
    token,
    username,
    reponame,
    actualBuildNum,
    expectBuildNum,
  };
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
  await downloadArtifacts(token)(actualDirPath)({
    vcsType: 'github',
    username,
    project: reponame,
    buildNum: actualBuildNum,
  });
  await downloadArtifacts(token)(expectDirPath)({
    vcsType: 'github',
    username,
    project: reponame,
    buildNum: expectBuildNum,
  });
  const result = await createImageDiffByDir({
    actualImage: actualDirPath,
    expectedImage: expectDirPath,
    diffImage: diffDirPath,
  });
  await putFile(resultJsonPath)(JSON.stringify(result));
  post()(slackIncoming)({
    text: `Finish test by <${env.appUri}/api/v1/builds/${encoded}|here>`,
  });
})

.get(`${route}/:encoded`, async (req, res) => {
  const { encoded } = req.params;
  const identifier = decode(env.cryptSecret)(encoded);
  const hashed = hash(identifier);
  const dirpath = `${env.workDirPath}/${hashed}`;
  const jsonPath = `${dirpath}/index.json`;
  res.send(
    JSON.parse(await getTextFile(jsonPath))
    .map(x => ({
      ...x,
      actualImagePath: `/assets/${hashed}/actual${x.path}`,
      expectImagePath: `/assets/${hashed}/expect{x.path}`,
      diffImagePath: `/assets/${hashed}/diff{x.path}`,
    })),
  );
});

export default build;
