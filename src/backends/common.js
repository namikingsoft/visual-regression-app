// @flow
import express from 'express';
import type { $Application } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';

type Route = string;
type DirPath = string;

export const start:
  number => $Application => Promise<string>
= port => app => new Promise(
  (resolve, reject) => app.listen(
    port, error => (
      error ? reject(error) : resolve(`http://localhost:${port}`)
    ),
  ),
);

export const parse:
  $Application => $Application
= app => app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(cookieParser());

export const enableCompression:
  $Application => $Application
= app => app.use(compression());

export const staticRoute:
  DirPath => Route => $Application => $Application
= dirPath => route => app => app.use(route, express.static(dirPath));
