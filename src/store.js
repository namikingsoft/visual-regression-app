// @flow
import { createStore, applyMiddleware, compose } from 'redux';
import cookie from 'middlewares/cookie';
import localStorage from 'middlewares/localStorage';
import websocket from 'middlewares/websocket';
import reducer from 'reducers';
import { routerMiddleware, syncHistoryWithStore } from 'react-router-redux';
import { browserHistory } from 'react-router';

const { devToolsExtension } = window;

type NodeEnv = string;
type Store = any;
type History = any;

const createStoreAndHistory: NodeEnv => { store: Store, history: History }
= nodeEnv => {
  const history = browserHistory;
  const store = createStore(reducer, compose(
    applyMiddleware(
      cookie,
      localStorage,
      websocket,
      routerMiddleware(history),
    ),
    nodeEnv !== 'production' && devToolsExtension ? devToolsExtension() : f => f,
  ));
  return { store, history: syncHistoryWithStore(history, store) };
};

export default createStoreAndHistory;
