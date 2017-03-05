// @flow
import type { Dispatch as DispatchOrigin } from 'redux';
import type { DiffBuild, EncodedIdentifierParam } from 'domains/DiffBuild';

export type Action =
    { type: 'DiffBuild/CREATE', payload: DiffBuild }
  | { type: 'DiffBuild/RUN', payload: EncodedIdentifierParam }
  | { type: 'Loading/START' }
  | { type: 'Loading/FINISH' }
  ;

export type Dispatch = DispatchOrigin<Action>;
