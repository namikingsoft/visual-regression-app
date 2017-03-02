// @flow
import type { Reducer } from 'redux';
import type { Action } from 'actions';

export type Loading = {
  remainCount: number,
};

export const create:
  void => Loading
= () => ({ remainCount: 0 });

export const isLoading:
  Loading => boolean
= x => x.remainCount > 0;

export const startLoading:
  Loading => Loading
= x => ({ ...x, remainCount: x.remainCount + 1 });

export const finishLoading:
  Loading => Loading
= x => ({ ...x, remainCount: Math.max(x.remainCount - 1, 0) });

export const reducer:
  Reducer<Loading, Action>
= (state = create(), action) => {
  switch (action.type) {
    case 'Loading/START':
      return startLoading(state);
    case 'Loading/FINISH':
      return finishLoading(state);
    default:
      return state;
  }
};
