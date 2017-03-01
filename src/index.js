// @flow
import type { $Application } from 'express';
import { ServerSocket } from 'ws';
import { pipe } from 'ramda';
import express from 'express';
import del from 'del';
import { mkdir } from 'utils/file';
import { andThen } from 'utils/functional';
import { browserHistory } from 'backends/history';
import { devMiddleware } from 'backends/webpack';
import { buildResource, buildSocket } from 'backends/build';
import * as common from 'backends/common';
import * as env from 'env';
import webpack from '../webpack.config';

const routes:
  $Application => $Application
= pipe(
  common.staticRoute(env.workDirPath)('/assets'),
  buildResource('/api/v1/builds'),
);

const sockets:
  net$Server => ServerSocket
= pipe(
  common.createSocketServer,
  buildSocket,
);

export const startDevelopment:
  $Application => Promise<string>
= pipe(
  common.parse,
  routes,
  devMiddleware(webpack),
  browserHistory,
  devMiddleware(webpack),
  common.listen(env.port),
  andThen(sockets),
);

export const startProduction:
  $Application => Promise<string>
= pipe(
  common.parse,
  common.enableCompression,
  routes,
  common.staticRoute(webpack.output.path)('/'),
  browserHistory,
  common.staticRoute(webpack.output.path)('/'),
  common.listen(env.port),
  andThen(sockets),
);

export const main:
  void => Promise<void>
= async () => {
  const isProd = env.nodeEnv === 'production';
  const startServer = isProd ? startProduction : startDevelopment;
  await del(env.workDirPath, { force: true });
  await mkdir(env.workDirPath);
  await startServer(express());
};

main();
