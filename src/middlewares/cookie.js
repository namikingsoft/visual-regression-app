// @flow
// import cookie from 'react-cookie';
import type { Middleware } from 'redux';
import type { Action } from 'actions';

const cookieMiddleware:
  Middleware<any, Action>
= () => next => action => next(action);

export default cookieMiddleware;
