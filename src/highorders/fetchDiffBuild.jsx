// @flow
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { getDiffBuild } from 'domains/DiffBuild';
import { willMount } from 'highorders/lifecycle';
import type { Dispatch } from 'actions';

type Props = {
  encoded: string,
  dispatch: Dispatch,
};

const fetchDiffBuild:
  <T:any>(React$Component<*, T, *>) => React$Component<*, T, *>
= Component => compose(
  connect(
    (_, { params: { encoded } }) => ({ encoded }),
  ),
  willMount(({ encoded, dispatch }: Props) =>
    getDiffBuild(encoded)(dispatch),
  ),
)(Component);

export default fetchDiffBuild;
