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
} from 'domains/DiffBuildBackend';
import * as env from 'env';

type Route = string;

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
      await postStartMessage(slackIncoming)(identifier);
      const result = await buildDiffImages(env.workDirPath)(identifier);
      const uri = `${env.appUri}/builds/${encoded}`;
      await postFinishMessage(slackIncoming)(result, uri);
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
    throw error;
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
      await buildDiffImages(env.workDirPath)(identifier);
      ws.send(JSON.stringify({ type: data.type, status: true, payload: encoded }));
    } catch (error) {
      ws.send(JSON.stringify({ type: data.type, status: false, error }));
    }
  }),
);
