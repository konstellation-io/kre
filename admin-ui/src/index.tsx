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
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { createUploadLink } from 'apollo-upload-client';

config
  .then(envVariables => {
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
      }
    });
    const uploadLink = createUploadLink({
      uri: `${envVariables.API_BASE_URL}/graphql`,
      credentials: 'include'
    });

    const link = ApolloLink.from([errorLink, uploadLink]);

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
