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
      await getDiffBuild(data.payload.encoded)(dispatch);
    } else {
      dispatch(replace('/'));
    }
    dispatch({ type: 'Loading/FINISH' });
    dispatch({ type: 'Progress/FINISH' });
  });
  socket.on('DiffBuild/PROGRESS', async data => {
    dispatch({
      type: 'Progress/SET',
      percent: data.percent,
      label: data.label,
    });
  });
  return next => action => {
    switch (action.type) {
      case 'DiffBuild/RUN': {
        dispatch({ type: 'Loading/START' });
        dispatch({ type: 'Progress/START' });
        socket.emit('DiffBuild/RUN', { payload: action.payload });
        break;
      }
      default:
    }
    return next(action);
  };
};

export default websocketMiddleware;
