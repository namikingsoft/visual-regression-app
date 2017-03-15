// @flow
import type { Reducer } from 'redux';
import { pipe } from 'ramda';
import type { Action } from 'actions';

export type Progress = {
  show: boolean,
  percent: number,
  label: string,
};

export const create:
  void => Progress
= () => ({ show: false, percent: 0, label: '' });

export const startProgress:
  Progress => Progress
= x => ({ ...x, show: true, percent: 0, label: '' });

export const finishProgress:
  Progress => Progress
= x => ({ ...x, show: false, percent: 0, label: '' });

export const setPercent:
  number => Progress => Progress
= percent => x => ({ ...x, percent });

export const setLabel:
  string => Progress => Progress
= label => x => ({ ...x, label });

export const reducer:
  Reducer<Progress, Action>
= (state = create(), action) => {
  switch (action.type) {
    case 'Progress/START':
      return startProgress(state);
    case 'Progress/FINISH':
      return finishProgress(state);
    case 'Progress/SET':
      return pipe(
        setPercent(action.percent),
        setLabel(action.label),
      )(state);
    default:
      return state;
  }
};
