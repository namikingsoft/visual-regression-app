// @flow
import 'style'; // css framework modules: need loading at first line
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { Router } from 'react-router';
import createStoreAndHistory from 'store';
import routes from 'routes';
import i18n from 'i18n';
import { nodeEnv } from 'env';

const { store, history } = createStoreAndHistory(nodeEnv);

render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <Router history={history} routes={routes} />
    </I18nextProvider>
  </Provider>,
  (document.body: any).appendChild(
    document.createElement('div'),
  ),
);
