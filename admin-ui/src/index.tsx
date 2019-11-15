import config from './config';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store';
import App from './App';
import { ApolloProvider } from '@apollo/react-hooks';
import './styles/app.global.scss';

import * as ROUTE from './constants/routes';
import history from './history';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';

config
  .then(envVariables => {
    const cache = new InMemoryCache();
    const httpLink = createHttpLink({
      uri: `${envVariables.API_BASE_URL}/graphql`,
      credentials: 'include'
    });
    const errorLink = onError(({ networkError }) => {
      // @ts-ignore
      if (networkError.statusCode === 401) {
        history.push(ROUTE.LOGIN);
        client.resetStore();
      }
    });
    const link = errorLink.concat(httpLink);

    const client = new ApolloClient({
      cache,
      link
    });

    ReactDOM.render(
      <ApolloProvider client={client}>
        <Provider store={configureStore()}>
          <App />
        </Provider>
      </ApolloProvider>,
      document.getElementById('root')
    );
  })
  .catch(err => {
    console.error('Cannot get configuration file.', err);
  });
