// @flow
/* eslint-disable immutable/no-mutation */
import type { Middleware } from 'redux';
import type { Action } from 'actions';

export const websocketMiddleware:
  Middleware<any, Action>
= () => {
  const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
  ws.onmessage = e => {
    console.log(e.data);
  };
  setTimeout(() => {
    ws.send('test');
  }, 2000);
  return next => action => next(action);
};

export default websocketMiddleware;
