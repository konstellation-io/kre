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

import typeDefs, {
  LogPanel,
  NotificationType
} from './graphql/client/typeDefs';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloLink, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { onError, ErrorResponse } from 'apollo-link-error';
import { createUploadLink } from 'apollo-upload-client';
import { getMainDefinition } from 'apollo-utilities';
import { GetLogs_nodeLogs } from './graphql/subscriptions/types/GetLogs';
import { ADD_NOTIFICATION } from './graphql/client/mutations/addNotification.graphql';
import {
  addNotificationResolver,
  removeNotificationResolver
} from './graphql/client/resolvers';

export let cache: InMemoryCache;

export interface LocalState {
  loggedIn: boolean;
  logs: GetLogs_nodeLogs[];
  notifications: [];
  logPanel: LogPanel | null;
  logsOpened: boolean;
}
interface DefaultCache {
  data: LocalState;
}

const UNAUTHORIZED_MESSAGE = 'missing or malformed jwt';

function userIsUnauthorized(error: ErrorResponse) {
  return get(error, 'networkError.result.message') === UNAUTHORIZED_MESSAGE;
}

function getNotificationIdAndMessage(error: ErrorResponse) {
  let notificationId;
  let notificationMessage;

  if (error.networkError) {
    if (!userIsUnauthorized(error)) {
      notificationId = 'Network error';
      notificationMessage = `ERROR: ${error.networkError.message}`;
    }
  } else if (error.graphQLErrors) {
    notificationId = error.operation.operationName;
    notificationMessage = error.response
      ? `ERROR: ${get(error, 'response.errors')[0].message}`
      : 'ERROR: unknown graphQL error';
  }

  return [notificationId, notificationMessage];
}

function addNotification(
  client: ApolloClient<NormalizedCacheObject>,
  notificationMessage?: string,
  notificationId?: string
) {
  if (notificationMessage !== undefined && notificationId !== undefined) {
    client.mutate({
      mutation: ADD_NOTIFICATION,
      variables: {
        input: {
          id: notificationId,
          message: notificationMessage,
          type: NotificationType.ERROR,
          timeout: 0,
          to: ''
        }
      }
    });
  }
}

config
  .then(envVariables => {
    const API_BASE_URL_WS = envVariables.API_BASE_URL.replace('http', 'ws');

    cache = new InMemoryCache();
    const errorLink = onError((error: ErrorResponse) => {
      const [notificationId, notificationMessage] = getNotificationIdAndMessage(
        error
      );
      addNotification(client, notificationMessage, notificationId);

      if (
        get(error, 'networkError.statusCode') === 400 &&
        userIsUnauthorized(error) &&
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
        lazy: true,
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

    const defaultCache: DefaultCache = {
      data: {
        loggedIn: false,
        logs: [],
        notifications: [],
        logPanel: null,
        logsOpened: false
      }
    };

    const client = new ApolloClient({
      cache,
      link,
      typeDefs,
      resolvers: {
        Mutation: {
          addNotification: addNotificationResolver,
          removeNotification: removeNotificationResolver
        }
      }
    });

    // Sets initial cache
    cache.writeData(defaultCache);
    // onResetStore callback must return a Promise
    client.onResetStore(() =>
      Promise.resolve(() => cache.writeData(defaultCache))
    );

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
