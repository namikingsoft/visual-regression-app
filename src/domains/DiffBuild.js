// @flow
import { pipe, filter, sortBy, not, length } from 'ramda';
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
};

export type ImageInfo = {
  path: Path,
  imagePath: Path,
};

export type DiffBuild = {
  ciToken: string,
  username: Path,
  reponame: Path,
  actualBuildNum: number,
  expectBuildNum: number,
  maxPercentage: number,
  avgPercentage: number,
  diffCount: number,
  newImages: ImageInfo[],
  delImages: ImageInfo[],
  threshold: number,
  pathFilters: any,
  images: ImageDiff[],
};

const initialState = {
  ciToken: '',
  username: '',
  reponame: '',
  actualBuildNum: 0,
  expectBuildNum: 0,
  maxPercentage: 0,
  avgPercentage: 0,
  diffCount: 0,
  threshold: 0,
  pathFilters: [],
  newImages: [],
  delImages: [],
  images: [],
};

export const isLoaded:
  DiffBuild => boolean
= x => x.username !== '';

export const isSuccess:
  DiffBuild => boolean
= x => x.maxPercentage < x.threshold;

export const isFailed:
  DiffBuild => boolean
= pipe(isSuccess, not);

export const filterDiffImages:
  DiffBuild => ImageDiff[]
= pipe(
  x => x.images,
  filter(x => x.percentage > 0),
);

export const filterManyDiffImages:
  DiffBuild => ImageDiff[]
= build => pipe(
  x => x.images,
  filter(x => x.percentage > build.threshold),
)(build);

export const filterLessDiffImages:
  DiffBuild => ImageDiff[]
= build => pipe(
  x => x.images,
  filter(x => x.percentage <= build.threshold && x.percentage > 0),
)(build);

export const countDiff:
  DiffBuild => number
= pipe(
  filterDiffImages,
  length,
);

export const countManyDiff:
  DiffBuild => number
= pipe(
  filterManyDiffImages,
  length,
);

export const countLessDiff:
  DiffBuild => number
= pipe(
  filterLessDiffImages,
  length,
);

export const listManyDiffImages:
  DiffBuild => ImageDiff[]
= pipe(
  filterManyDiffImages,
  sortBy(x => -x.percentage),
);

export const listLessDiffImages:
  DiffBuild => ImageDiff[]
= pipe(
  filterLessDiffImages,
  sortBy(x => -x.percentage),
);

export const getDiffBuild:
  EncodedIdentifier => Dispatch => Promise<any>
= encoded => async dispatch => {
  try {
    dispatch({ type: 'Loading/START' });
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
  dispatch({ type: 'Loading/FINISH' });
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
