// @flow
import Root from 'containers/Root';
import Test from 'pages/Test';
import Through from 'components/Through';

export default {
  path: '/',
  component: Root,
  indexRoute: {
    component: Through,
  },
  childRoutes: [
    {
      path: 'test',
      component: Test,
    },
  ],
};
