// @flow
/* eslint-disable immutable/no-mutation */
import type { Middleware } from 'redux';
import type { Action } from 'actions';
import { getDiffBuild } from 'domains/DiffBuild';

export const websocketMiddleware:
  Middleware<any, Action>
= ({ dispatch }) => {
  const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
  ws.onmessage = e => {
    const data = JSON.parse((e.data: any));
    switch (data.type) {
      case 'DiffBuild/RUN': {
        if (data.status) {
          getDiffBuild(data.payload)(dispatch);
        }
        dispatch({ type: 'Loading/FINISH' });
        break;
      }
      default:
    }
  };
  return next => action => {
    switch (action.type) {
      case 'DiffBuild/RUN': {
        dispatch({ type: 'Loading/START' });
        ws.send(JSON.stringify({ type: action.type, payload: action.payload }));
        break;
      }
      default:
    }
    return next(action);
  };
};

export default websocketMiddleware;
