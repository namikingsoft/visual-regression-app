// @flow
import type { Dispatch as DispatchOrigin } from 'redux';
import type { DiffBuild, EncodedIdentifier } from 'domains/DiffBuild';

export type Action =
    { type: 'DiffBuild/CREATE', payload: DiffBuild }
  | { type: 'DiffBuild/RUN', payload: EncodedIdentifier }
  | { type: 'Loading/START' }
  | { type: 'Loading/FINISH' }
  ;

export type Dispatch = DispatchOrigin<Action>;
