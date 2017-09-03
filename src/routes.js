// @flow
import { compose } from 'ramda';
import Root from 'containers/Root';
import Dashboard from 'containers/Dashboard';

import DiffBuildDetail from 'pages/DiffBuildDetail';
import NotFound from 'pages/NotFound';

import loading from 'highorders/loading';
import lightbox from 'highorders/lightbox';
import fetchDiffBuild from 'highorders/fetchDiffBuild';

export default {
  path: '/',
  component: Root,
  childRoutes: [
    {
      component: compose(loading, lightbox)(Dashboard),
      indexRoute: {
        component: NotFound,
      },
      childRoutes: [
        {
          path: 'builds',
          component: fetchDiffBuild(DiffBuildDetail),
        },
        {
          path: '*',
          component: NotFound,
        },
      ],
    },
  ],
};
