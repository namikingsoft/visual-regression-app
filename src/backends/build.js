// @flow
import type { $Application } from 'express';
import type { $SocketIO } from 'socket.io';
import { stringify } from 'query-string';
import { getTextFile } from 'utils/file';
import { hash } from 'utils/crypt';
import {
  extractBuildParam,
  getWorkLocation,
  postFinishMessage,
  postErrorMessage,
  buildDiffImagesFromS3,
  isBuilding,
  untilFinishBuilding,
  getResource,
} from 'domains/DiffBuildBackend';
import * as env from 'env';

type Route = string;

const s3param = {
  accessKeyId: env.awsAccessKeyId,
  secretAccessKey: env.awsSecretAccessKey,
  bucketName: env.awsS3BucketName,
};

export const resource:
  Route => $Application => $Application
= route => app => (app: any)
.post(route, async (req, res) => {
  try {
    const { slackIncoming } = req.body;
    const buildParam = extractBuildParam(req.body);
    const urlView = `${env.appUri}/builds?${stringify(buildParam)}`;
    const urlInfo = `${env.appUri}${route}?${stringify(buildParam)}`;
    if (await isBuilding(env.workDirPath)(buildParam)) {
      throw new Error('already accepted');
    }
    try {
      res.status(202).send({ ...buildParam, urlView, urlInfo });
      res.end();
      const buildDiffImages = buildDiffImagesFromS3(env.workDirPath, s3param);
      const result = await buildDiffImages(buildParam, (per, label) => {
        console.log(`progress: ${per}% ${label}`);
      });
      if (slackIncoming) await postFinishMessage(slackIncoming)(result, urlView);
    } catch (err) {
      if (slackIncoming) postErrorMessage(slackIncoming)(err);
      console.error(err);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
    throw err;
  }
})
.get(route, async (req, res) => {
  try {
    const buildParam = extractBuildParam(req.query);
    if (await isBuilding(env.workDirPath)(buildParam)) {
      res.status(423).send('Waiting ...'); // lock
      return;
    }
    const { hashed, resultJsonPath } = getWorkLocation(env.workDirPath)(buildParam);
    const result = JSON.parse(await getTextFile(resultJsonPath));
    res.status(200).send(getResource(result)(`${env.appUri}/assets/${hashed}`));
  } catch (err) {
    res.status(404).send('404 Not Found');
    throw err;
  }
});

const joinRoom = roomName => client => new Promise((resolve, reject) => (
  client.join(roomName, err => (err ? reject(err) : resolve()))
));

export const socketFront:
  $SocketIO => $SocketIO
= io => io.on('connection', socket => socket
  .on('DiffBuild/RUN', async ({ payload }) => {
    try {
      const buildParam = extractBuildParam(payload);
      const roomName = hash(buildParam);
      await joinRoom(roomName)(socket);
      if (await isBuilding(env.workDirPath)(buildParam)) {
        await untilFinishBuilding(env.workDirPath)(buildParam);
      } else {
        const buildDiffImages = buildDiffImagesFromS3(env.workDirPath, s3param);
        await buildDiffImages(buildParam, (percent, label) => {
          console.log(`progress: ${percent}% ${label}`);
          socket.emit('DiffBuild/PROGRESS', { percent, label });
          socket.broadcast.to(roomName).emit('DiffBuild/PROGRESS', { percent, label });
        });
      }
      socket.emit('DiffBuild/RUN', { status: true, payload });
    } catch (err) {
      socket.emit('DiffBuild/RUN', { status: false, error: err.message });
      throw err;
    }
  }),
);
