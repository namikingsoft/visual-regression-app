// @flow
import type { Dispatch as DispatchOrigin } from 'redux';
import type { DiffBuild } from 'domains/DiffBuild';

export type Action =
    { type: 'DiffImage/CREATE', payload: DiffBuild }
  | { type: 'dummy/LOAD' }
  ;

export type Dispatch = DispatchOrigin<Action>;
