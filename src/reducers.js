// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { reducer as diffBuild } from 'domains/DiffBuild';

export default combineReducers({
  routing,
  diffBuild,
});
