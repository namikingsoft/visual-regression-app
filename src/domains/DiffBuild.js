// @flow
import { pipe, filter } from 'ramda';
import type { Reducer } from 'redux';
import type { Action } from 'actions';
import * as API from 'domains/API';

export type EncodedIdentifier = string;

export type ImageDiff = {
  path: string,
  actualImagePath: string,
  expectImagePath: string,
  diffImagePath: string,
  total: number,
  percentage: number,
}

export type DiffBuild = {
  token: string,
  username: string,
  reponame: string,
  actualBuildNum: number,
  expectBuildNum: number,
  images: ImageDiff[],
}

const initialState = {
  token: '',
  username: '',
  reponame: '',
  actualBuildNum: 0,
  expectBuildNum: 0,
  images: [],
};

export const listDiffImages:
  DiffBuild => ImageDiff[]
= pipe(
  x => x.images,
  filter(x => x.total > 0),
);

export const getDiffBuild:
  EncodedIdentifier => Dispatch => Promise<any>
= encoded => async dispatch => {
  try {
    dispatch({
      type: 'DiffBuild/CREATE',
      payload: await API.getDiffBuild(encoded),
    });
  } catch (e) {
    console.error(e);
  }
};

export const reducer:
  Reducer<DiffBuild, Action>
= (state = initialState, action) => {
  switch (action.type) {
    case 'DiffBuild/CREATE':
      return { ...action.payload };
    default:
      return state;
  }
};
