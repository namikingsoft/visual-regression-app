// @flow
import type { Middleware } from 'redux';
import type { Action } from 'actions';

export const localStorageMiddleware:
  Middleware<any, Action>
= () => next => action => next(action);

export default localStorageMiddleware;
