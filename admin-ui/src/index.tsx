import { get } from 'lodash';
import config from './config';

import React from 'react';
import ReactDOM from 'react-dom';
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

export let cache: any = null;

config
  .then(envVariables => {
    const API_BASE_URL_WS = envVariables.API_BASE_URL.replace('http', 'ws');

    cache = new InMemoryCache();
    const errorLink = onError(({ networkError }: any) => {
      if (
        get(networkError, 'statusCode') === 400 &&
        get(networkError, 'result.message') === 'missing or malformed jwt' &&
        history.location.pathname !== ROUTE.LOGIN
      ) {
        history.push(ROUTE.LOGIN);
        client.resetStore();
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

    const defaultCache = { data: { loggedIn: false } };

    const client = new ApolloClient({
      cache,
      link
    });

    // Sets initial cache
    cache.writeData(defaultCache);
    client.onResetStore(() => cache.writeData(defaultCache));

    ReactDOM.render(
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>,
      document.getElementById('root')
    );
  })
  .catch(err => {
    console.error('Cannot get configuration file.', err);
  });
