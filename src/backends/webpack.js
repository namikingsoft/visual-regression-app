// @flow
import type { $Application, Middleware } from 'express';
import Webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

type Config = any;

let devMiddlewareCache: any; // eslint-disable-line immutable/no-let

const createOrCache:
  Config => Middleware
= config => {
  if (!devMiddlewareCache) {
    devMiddlewareCache = webpackDevMiddleware(Webpack(config), config.devServer);
  }
  return devMiddlewareCache;
};

export const devMiddleware:
  Config => $Application => $Application
= config => app => app.use(createOrCache(config));

export default devMiddleware;
