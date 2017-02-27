// @flow
import Root from 'containers/Root';
import DiffBuildDetail from 'pages/DiffBuildDetail';
import NotFound from 'pages/NotFound';
import fetchDiffBuild from 'highorders/fetchDiffBuild';

export default {
  path: '/',
  component: Root,
  indexRoute: {
    component: NotFound,
  },
  childRoutes: [
    {
      path: 'builds/:encoded',
      component: fetchDiffBuild(DiffBuildDetail),
    },
    {
      path: '*',
      component: NotFound,
    },
  ],
};
