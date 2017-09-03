// @flow
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getDiffBuild } from 'domains/DiffBuild';
import type { BuildParam } from 'domains/DiffBuild';
import { willMount } from 'highorders/lifecycle';
import type { Dispatch } from 'actions';

type Props = {
  query: BuildParam,
  dispatch: Dispatch,
};

const fetchDiffBuild:
  <T:*>(React$Component<*, T, *>) => React$Component<*, T, *>
= Component => compose(
  connect(
    (_, { location: { query } }) => ({ query }),
  ),
  willMount(({ query, dispatch }: Props) =>
    getDiffBuild(query)(dispatch),
  ),
)(Component);

export default fetchDiffBuild;
