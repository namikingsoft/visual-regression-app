// @flow
import type { $Application } from 'express';
import { Server as ServerSocket } from 'ws';
import { postMessage } from 'domains/Slack';
import { getTextFile } from 'utils/file';
import { encode, decode } from 'utils/crypt';
import {
  extractPayload,
  extractIdentifier,
  getWorkLocation,
  postStartMessage,
  postFinishMessage,
  buildDiffImages,
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
    res.status(202).send({ ...identifier, token: undefined });
    res.end();
    try {
      await postStartMessage(slackIncoming)(identifier);
      const result = await buildDiffImages(env.workDirPath)(identifier);
      const uri = `${env.appUri}/builds/${encoded}`;
      await postFinishMessage(slackIncoming)(result, uri);
    } catch (err) {
      postMessage(slackIncoming)({ text: 'Occurred error.' });
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
    res.status(400).send({ error: err.message });
    throw err;
  }
});

export const websocket:
  ServerSocket => ServerSocket
= wss => wss.on('connection', ws => ws
  .on('message', async json => {
    const data = JSON.parse(json);
    if (data.type !== 'DiffBuild/RUN') return;
    try {
      const encoded = data.payload;
      const identifier = decode(env.cryptSecret)(encoded);
      await buildDiffImages(env.workDirPath)(identifier);
      ws.send(JSON.stringify({ type: data.type, status: true, payload: encoded }));
    } catch (err) {
      ws.send(JSON.stringify({ type: data.type, status: false, error: err.message }));
      throw err;
    }
  }),
);
