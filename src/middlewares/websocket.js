// @flow
import SocketIO from 'socket.io-client';
import { replace } from 'react-router-redux';
import type { Middleware } from 'redux';
import type { Action } from 'actions';
import { getDiffBuild } from 'domains/DiffBuild';

export const websocketMiddleware:
  Middleware<any, Action>
= ({ dispatch }) => {
  const socket = SocketIO();
  socket.on('DiffBuild/RUN', async data => {
    if (data.status) {
      getDiffBuild(data.payload.encoded)(dispatch);
    } else {
      dispatch(replace('/'));
    }
    dispatch({ type: 'Loading/FINISH' });
  });
  return next => action => {
    switch (action.type) {
      case 'DiffBuild/RUN': {
        dispatch({ type: 'Loading/START' });
        socket.emit('DiffBuild/RUN', { payload: action.payload });
        break;
      }
      default:
    }
    return next(action);
  };
};

export default websocketMiddleware;
