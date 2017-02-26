// @flow
import type { Dispatch as DispatchOrigin } from 'redux';

export type Action =
    { type: 'dummy/CREATE', payload: string }
  | { type: 'dummy/DELETE' }
  ;

export type Dispatch = DispatchOrigin<Action>;
