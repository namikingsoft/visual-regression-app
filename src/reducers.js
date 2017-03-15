// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as diffBuild } from 'domains/DiffBuild';
import { reducer as loading } from 'domains/Loading';
import { reducer as progress } from 'domains/Progress';

export default combineReducers({
  routing,
  diffBuild,
  loading,
  progress,
});
