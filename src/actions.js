// @flow
import type { Dispatch as DispatchOrigin } from 'redux';
import type { DiffBuild, EncodedIdentifierParam } from 'domains/DiffBuild';

export type Action =
    { type: 'DiffBuild/CREATE', payload: DiffBuild }
  | { type: 'DiffBuild/RUN', payload: EncodedIdentifierParam }
  | { type: 'Loading/START' }
  | { type: 'Loading/FINISH' }
  | { type: 'Progress/START' }
  | { type: 'Progress/FINISH' }
  | { type: 'Progress/SET', percent: number, label: string }
  ;

export type Dispatch = DispatchOrigin<Action>;
