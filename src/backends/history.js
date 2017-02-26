// @flow
import type { $Application } from 'express';

export const browserHistory:
  $Application => $Application
= app => (app: any).get('*', (req, res, next) => { // TODO: any type
  /* eslint-disable */
  req.url = '/';
  /* eslint-enable */
  next();
});
