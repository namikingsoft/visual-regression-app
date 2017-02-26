// @flow
import { lifecycle } from 'recompose';

/* eslint-disable immutable/no-this */

type Props = any;
type ReactComponent = any;
type LifecycleFunction = Props => any;
type LifecycleFunctionWithNext = (current: Props, next: Props) => any;

export const willMount:
  LifecycleFunction => ReactComponent => ReactComponent
= f => Component => lifecycle({
  componentWillMount() {
    f(this.props);
  },
})(Component);

export const didMount:
  LifecycleFunction => ReactComponent => ReactComponent
= f => Component => lifecycle({
  componentDidMount() {
    f(this.props);
  },
})(Component);

export const willReceiveProps:
  LifecycleFunctionWithNext => ReactComponent => ReactComponent
= f => Component => lifecycle({
  componentWillReceiveProps(nextProps) {
    f(this.props, nextProps);
  },
})(Component);

export const willUpdate:
  LifecycleFunction => ReactComponent => ReactComponent
= f => Component => lifecycle({
  componentWillUpdate(nextProps, nextState) {
    f(this.props, nextProps, nextState);
  },
})(Component);

export const didUpdate:
  LifecycleFunction => ReactComponent => ReactComponent
= f => Component => lifecycle({
  componentDidUpdate(prevProps, prevState) {
    f(this.props, prevProps, prevState);
  },
})(Component);

export const willUnmount:
  LifecycleFunction => ReactComponent => ReactComponent
= f => Component => lifecycle({
  componentWillUnmount(prevProps, prevState) {
    f(this.props, prevProps, prevState);
  },
})(Component);
