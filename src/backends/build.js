// @flow
import type { $Application } from 'express';
import type { $SocketIO } from 'socket.io';
import { getTextFile } from 'utils/file';
import {
  extractBuildParam,
  getWorkLocation,
  buildDiffImagesFromS3,
  isBuilding,
  untilFinishBuilding,
  getResource,
} from 'domains/DiffBuildBackend';
import * as env from 'env';

type Route = string;

export const resource:
  Route => $Application => $Application
= route => app => (app: any)
.get(route, async (req, res) => {
  try {
    const buildParam = extractBuildParam(req.query);
    const { hashed, resultJsonPath } = getWorkLocation(env.workDirPath)(buildParam);
    const result = JSON.parse(await getTextFile(resultJsonPath));
    res.status(200).send(getResource(result)(`${env.appUri}/assets/${hashed}`));
  } catch (err) {
    res.status(404).send({ error: err.message });
    throw err;
  }
});

export const socket:
  $SocketIO => $SocketIO
= io => io.on('connection', client => client
  .on('DiffBuild/RUN', async ({ payload }) => {
    try {
      const s3param = {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
        bucketName: env.awsS3BucketName,
      };
      const buildParam = extractBuildParam(payload);
      if (await isBuilding(env.workDirPath)(buildParam)) {
        await untilFinishBuilding(env.workDirPath)(buildParam);
      } else {
        const buildDiffImages = buildDiffImagesFromS3(env.workDirPath, s3param);
        await buildDiffImages(buildParam, (percent, label) => {
          client.emit('DiffBuild/PROGRESS', { percent, label });
        });
      }
      client.emit('DiffBuild/RUN', { status: true, payload });
    } catch (err) {
      client.emit('DiffBuild/RUN', { status: false, error: err.message });
      throw err;
    }
  }),
);
