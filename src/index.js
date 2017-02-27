// @flow
import type { $Application } from 'express';
import { pipe } from 'ramda';
import express from 'express';
import del from 'del';
import { mkdir } from 'utils/file';
import { browserHistory } from 'backends/history';
import { devMiddleware } from 'backends/webpack';
import build from 'backends/build';
import * as common from 'backends/common';
import * as env from 'env';
import webpack from '../webpack.config';

const routes:
  $Application => $Application
= pipe(
  common.staticRoute(env.workDirPath)('/assets'),
  build('/api/v1/builds'),
);

export const startDevelopment:
  $Application => Promise<string>
= pipe(
  common.parse,
  routes,
  devMiddleware(webpack),
  browserHistory,
  devMiddleware(webpack),
  common.start(env.port),
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
  common.start(env.port),
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
