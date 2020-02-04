import config from './config';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store';
import App from './App';
import { ApolloProvider } from '@apollo/react-hooks';
import './styles/app.global.scss';
import './styles/d3.scss';

import ROUTE from './constants/routes';
import history from './history';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { onError } from 'apollo-link-error';
import { createUploadLink } from 'apollo-upload-client';
import { getMainDefinition } from 'apollo-utilities';

import { logout } from './actions/appActions';

config
  .then(envVariables => {
    const store = configureStore();

    const API_BASE_URL_WS = envVariables.API_BASE_URL.replace('http', 'ws');

    const cache = new InMemoryCache();
    const errorLink = onError(({ networkError }: any) => {
      if (
        networkError &&
        networkError.statusCode === 400 &&
        networkError &&
        networkError.result &&
        networkError.result.message === 'missing or malformed jwt'
      ) {
        history.push(ROUTE.LOGIN);
        client.resetStore();
        store.dispatch(logout());
      }
    });
    const uploadLink = createUploadLink({
      uri: `${envVariables.API_BASE_URL}/graphql`,
      credentials: 'include'
    });
    const wsLink = new WebSocketLink({
      uri: `${API_BASE_URL_WS}/graphql`,
      options: {
        reconnect: true
      }
    });

    const transportLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      uploadLink
    );

    const link = ApolloLink.from([errorLink, transportLink]);

    const client = new ApolloClient({
      cache,
      link
    });

    ReactDOM.render(
      <ApolloProvider client={client}>
        <Provider store={store}>
          <App />
        </Provider>
      </ApolloProvider>,
      document.getElementById('root')
    );
  })
  .catch(err => {
    console.error('Cannot get configuration file.', err);
  });
