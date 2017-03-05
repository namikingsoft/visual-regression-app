// @flow
import type { $Application } from 'express';
import type { $SocketIO } from 'socket.io';
import { getTextFile } from 'utils/file';
import { encode, decode } from 'utils/crypt';
import {
  extractPayload,
  extractIdentifier,
  getWorkLocation,
  postStartMessage,
  postFinishMessage,
  postErrorMessage,
  buildDiffImages,
  isBuilding,
  untilFinishBuilding,
  getResource,
} from 'domains/DiffBuildBackend';
import * as env from 'env';

type Route = string;

export const resource:
  Route => $Application => $Application
= route => app => (app: any)
.post(route, async (req, res) => {
  try {
    const { slackIncoming } = extractPayload(req.body);
    const identifier = extractIdentifier(req.body);
    const encoded = encode(env.cryptSecret)(identifier);
    if (await isBuilding(env.workDirPath)(identifier)) {
      throw new Error('already accepted');
    }
    try {
      res.status(202).send({ ...identifier, encoded });
      res.end();
      if (slackIncoming) await postStartMessage(slackIncoming)(identifier);
      const result = await buildDiffImages(env.workDirPath)(identifier);
      const uri = `${env.appUri}/builds/${encoded}`;
      if (slackIncoming) await postFinishMessage(slackIncoming)(result, uri);
    } catch (err) {
      if (slackIncoming) postErrorMessage(slackIncoming)(err);
      console.error(err);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
    throw err;
  }
})
.get(`${route}/:encoded`, async (req, res) => {
  try {
    const { encoded } = req.params;
    const identifier = decode(env.cryptSecret)(encoded);
    const { hashed, resultJsonPath } = getWorkLocation(env.workDirPath)(identifier);
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
      const { encoded } = payload;
      const identifier = decode(env.cryptSecret)(encoded);
      if (await isBuilding(env.workDirPath)(identifier)) {
        await untilFinishBuilding(env.workDirPath)(identifier);
      } else {
        await buildDiffImages(env.workDirPath)(identifier);
      }
      client.emit('DiffBuild/RUN', { status: true, payload });
    } catch (err) {
      client.emit('DiffBuild/RUN', { status: false, error: err.message });
      throw err;
    }
  }),
);
