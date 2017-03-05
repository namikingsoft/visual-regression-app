// @flow
import type { $Application } from 'express';
import type { $SocketIO } from 'socket.io';
import socketIO from 'socket.io';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';

type Route = string;
type DirPath = string;

export const listen:
  number => $Application => Promise<net$Server>
= port => app => new Promise((resolve, reject) => {
  const server = app.listen(port, err => (
    err ? reject(err) : resolve(server)
  ));
});

export const createSocketServer:
  net$Server => $SocketIO
= socketIO;

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
