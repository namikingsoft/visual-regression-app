// @flow
import type { Middleware } from 'redux';
import type { Action } from 'action';

export const localStorageMiddleware:
  Middleware<any, Action>
= () => next => action => next(action);

export default localStorageMiddleware;
