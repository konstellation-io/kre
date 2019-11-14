import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store';
import App from './App';
import { ApolloProvider } from '@apollo/react-hooks';
import './styles/app.global.scss';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: `${process.env.REACT_APP_API_BASE}/graphql`
});

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
