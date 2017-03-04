// @flow
import { replace } from 'react-router-redux';
import type { Middleware } from 'redux';
import type { Action } from 'actions';
import { getDiffBuild } from 'domains/DiffBuild';

type Payload = {
  type: 'DiffBuild/RUN',
  payload: string,
};

type MessageCallback = any => any;

const untilOpen:
  WebSocket => Promise<WebSocket>
= ws => new Promise(resolve => {
  const check = () => {
    if (ws.readyState === 1) {
      resolve(ws);
      return;
    }
    setTimeout(check, 500);
  };
  check();
});


const onMessage:
  MessageCallback => WebSocket => WebSocket
= callback => ws => {
  ws.onmessage = callback; //  eslint-disable-line
  return ws;
};

const send:
  Payload => WebSocket => Promise<WebSocket>
= payload => async ws => {
  await untilOpen(ws);
  ws.send(JSON.stringify(payload));
  return ws;
};

export const websocketMiddleware:
  Middleware<any, Action>
= ({ dispatch }) => {
  const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
  onMessage(async e => {
    await untilOpen(ws);
    const data = JSON.parse((e.data: any));
    switch (data.type) {
      case 'DiffBuild/RUN': {
        if (data.status) {
          getDiffBuild(data.payload)(dispatch);
        } else {
          dispatch(replace('/'));
        }
        dispatch({ type: 'Loading/FINISH' });
        break;
      }
      default:
    }
  })(ws);
  return next => action => {
    switch (action.type) {
      case 'DiffBuild/RUN': {
        dispatch({ type: 'Loading/START' });
        send({ type: action.type, payload: action.payload })(ws);
        break;
      }
      default:
    }
    return next(action);
  };
};

export default websocketMiddleware;
