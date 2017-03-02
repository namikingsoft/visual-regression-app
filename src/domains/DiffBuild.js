// @flow
import { pipe, filter, sortBy } from 'ramda';
import type { Reducer } from 'redux';
import type { Action } from 'actions';
import * as API from 'domains/API';

export type EncodedIdentifier = string;
export type Path = string;

export type ImageDiff = {
  path: Path,
  actualImagePath: Path,
  expectImagePath: Path,
  diffImagePath: Path,
  total: number,
  percentage: number,
}

export type DiffBuild = {
  token: Path,
  username: Path,
  reponame: Path,
  actualBuildNum: number,
  expectBuildNum: number,
  threshold: number,
  pathFilters: any,
  images: ImageDiff[],
}

const initialState = {
  token: '',
  username: '',
  reponame: '',
  actualBuildNum: 0,
  expectBuildNum: 0,
  threshold: 0,
  pathFilters: [],
  images: [],
};

export const listDiffImages:
  DiffBuild => ImageDiff[]
= build => pipe(
  x => x.images,
  filter(x => x.percentage > build.threshold),
  sortBy(x => -x.percentage),
)(build);

export const listLittleDiffImages:
  DiffBuild => ImageDiff[]
= build => pipe(
  x => x.images,
  filter(x => x.percentage > 0 && x.percentage < build.threshold),
  sortBy(x => -x.percentage),
)(build);

export const getDiffBuild:
  EncodedIdentifier => Dispatch => Promise<any>
= encoded => async dispatch => {
  try {
    dispatch({
      type: 'DiffBuild/CREATE',
      payload: await API.getDiffBuild(encoded),
    });
  } catch (e) {
    dispatch({
      type: 'DiffBuild/RUN',
      payload: encoded,
    });
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
