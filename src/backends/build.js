// @flow
import type { $Application } from 'express';
import { Server as ServerSocket } from 'ws';
import del from 'del';
import { pipe, filter, reduce, map, mean, max } from 'ramda';
import { andThen } from 'utils/functional';
import { getArtifacts, saveArtifacts, untilDoneBuild, getBuildViewUri } from 'domains/CircleCI';
import { postMessage } from 'domains/Slack';
import { putFile, getTextFile } from 'utils/file';
import { encode, decode } from 'utils/crypt';
import {
  createImageDiffByDir,
  getNewImagePathes,
  getDelImagePathes,
  extractPayload,
  extractIdentifier,
  getWorkLocation,
  createPathFilter,
} from 'domains/DiffBuildBackend';
import type {
  BuildIdentifier,
  ImageDiffResult,
} from 'domains/DiffBuildBackend';
import * as env from 'env';

type Route = string;

const buildDiffImages:
  BuildIdentifier => Promise<ImageDiffResult>
= async identifier => {
  const { token, username, reponame, actualBuildNum, expectBuildNum } = identifier;
  const pathFilter = createPathFilter(identifier.pathFilters);
  const locate = getWorkLocation(env.workDirPath)(identifier);
  const commonBuildParam = { vcsType: 'github', username, reponame };
  await untilDoneBuild(token)({ ...commonBuildParam, buildNum: actualBuildNum });
  await untilDoneBuild(token)({ ...commonBuildParam, buildNum: expectBuildNum });
  await del(locate.dirpath, { force: true });
  const saveFilteredArtifacts = buildNum => saveDirPath => pipe(
    getArtifacts(token),
    andThen(pipe(
      filter(x => pathFilter(x.path)),
      saveArtifacts(token)(saveDirPath),
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
    newImagePathes: await getNewImagePathes(pairPath),
    delImagePathes: await getDelImagePathes(pairPath),
    images,
  };
  await putFile(locate.resultJsonPath)(JSON.stringify(result));
  return result;
};

export const buildResource:
  Route => $Application => $Application
= route => app => (app: any)
.post(route, async (req, res) => {
  try {
    const { slackIncoming } = extractPayload(req.body);
    const identifier = extractIdentifier(req.body);
    const encoded = encode(env.cryptSecret)(identifier);
    res.status(202).send({ ...identifier, token: undefined });
    res.end();
    try {
      await postMessage(slackIncoming)({
        attachments: [{
          fallback: 'Start building images ...',
          pretext: 'Start building images ...',
          color: '#cccccc',
          fields: [
            {
              title: 'Actual Images',
              value: getBuildViewUri({
                username: identifier.username,
                reponame: identifier.reponame,
                buildNum: identifier.actualBuildNum,
              }),
              short: false,
            },
            {
              title: 'Expected Images',
              value: getBuildViewUri({
                username: identifier.username,
                reponame: identifier.reponame,
                buildNum: identifier.expectBuildNum,
              }),
              short: false,
            },
          ],
          footer: 'Start building images',
          ts: Math.floor(new Date().getTime() / 1000),
        }],
      });
      const result = await buildDiffImages(identifier);
      const diffCount = filter(x => x.percentage > 0)(result.images).length;
      const maxPercentage = pipe(
        map(x => x.percentage),
        reduce(max, 0),
      )(result.images);
      const avgPercentage = pipe(
        map(x => x.percentage),
        mean,
      )(result.images);
      postMessage(slackIncoming)({
        attachments: [{
          fallback: 'Finish building images',
          color: maxPercentage > identifier.threshold ? '#cc0000' : '#36a64f',
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
    } catch (error) {
      postMessage(slackIncoming)({
        text: 'Occurred error.',
      });
    }
  } catch (error) {
    res.status(400).send({ error });
    throw error;
  }
})
.get(`${route}/:encoded`, async (req, res) => {
  try {
    const { encoded } = req.params;
    const identifier = decode(env.cryptSecret)(encoded);
    const { hashed, resultJsonPath } = getWorkLocation(env.workDirPath)(identifier);
    const build = JSON.parse(await getTextFile(resultJsonPath));
    res.status(200).send({
      ...build,
      images: build.images.map(x => ({
        ...x,
        actualImagePath: `/assets/${hashed}/actual${x.path}`,
        expectImagePath: `/assets/${hashed}/expect${x.path}`,
        diffImagePath: `/assets/${hashed}/diff${x.path}`,
      })),
      newImages: build.newImagePathes.map(path => ({
        path,
        imagePath: `/assets/${hashed}/actual${path}`,
      })),
      delImages: build.delImagePathes.map(path => ({
        path,
        imagePath: `/assets/${hashed}/expect${path}`,
      })),
    });
  } catch (error) {
    res.status(400).send({ error });
  }
});

export const buildSocket:
  ServerSocket => ServerSocket
= wss => wss.on('connection', ws => ws
  .on('message', async json => {
    const data = JSON.parse(json);
    if (data.type !== 'DiffBuild/RUN') return;
    try {
      const encoded = data.payload;
      const identifier = decode(env.cryptSecret)(encoded);
      await buildDiffImages(identifier);
      ws.send(JSON.stringify({ type: data.type, status: true, payload: encoded }));
    } catch (error) {
      ws.send(JSON.stringify({ type: data.type, status: false, error }));
    }
  }),
);
