import 'Styles/app.global.scss';
import 'Styles/d3.scss';

import { ApolloLink, split } from 'apollo-link';
import { ErrorResponse, onError } from 'apollo-link-error';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import typeDefs, {
  LogPanel,
  NotificationType,
  OpenedVersion,
  UserSelection,
  UserSettings
} from 'Graphql/client/typeDefs';

import { ADD_NOTIFICATION } from 'Graphql/client/mutations/addNotification.graphql';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from '@apollo/react-hooks';
import App from './App';
import { GetServerLogs_logs_items } from 'Graphql/queries/types/GetServerLogs';
import ROUTE from 'Constants/routes';
import React from 'react';
import ReactDOM from 'react-dom';
import { WebSocketLink } from 'apollo-link-ws';
import addLogTabResolver from 'Graphql/client/resolvers/addLogTab';
import addNotificationResolver from 'Graphql/client/resolvers/addNotification';
import config from './config';
import { createUploadLink } from 'apollo-upload-client';
import { get } from 'lodash';
import { getMainDefinition } from 'apollo-utilities';
import history from './browserHistory';
import removeNotificationResolver from 'Graphql/client/resolvers/removeNotification';
import updateTabFiltersResolver from 'Graphql/client/resolvers/updateTabFilters';

export let cache: InMemoryCache;

export interface LocalState {
  loggedIn: boolean;
  logs: GetServerLogs_logs_items[];
  notifications: [];
  logTabs: LogPanel[];
  activeTabId: string;
  logsOpened: boolean;
  logsAutoScroll: boolean;
  openedVersion: OpenedVersion;
  userSettings: UserSettings;
}
interface DefaultCache {
  data: LocalState;
}

const UNAUTHORIZED_CODE = 'unauthorized';
const INVALID_SESSION_CODE = 'invalid_session';

function userIsUnauthorized(error: ErrorResponse) {
  return get(error, 'networkError.result.code') === UNAUTHORIZED_CODE;
}

function sessionIsInvalid(error: ErrorResponse) {
  return get(error, 'networkError.result.code') === INVALID_SESSION_CODE;
}

function getNotificationIdAndMessage(error: ErrorResponse) {
  let notificationId;
  let notificationMessage;

  if (error.networkError) {
    if (sessionIsInvalid(error)) {
      notificationId = 'ExpiredSession';
      notificationMessage = 'Your session has expired, please log in again';
    } else if (!userIsUnauthorized(error)) {
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

      if (
        get(error, 'networkError.statusCode') === 401 ||
        (get(error, 'networkError.statusCode') === 400 &&
          userIsUnauthorized(error) &&
          history.location.pathname !== ROUTE.LOGIN)
      ) {
        history.push(ROUTE.LOGIN);
        client.clearStore().then(() => {
          client.resetStore().then(() => {
            addNotification(client, notificationMessage, notificationId);
          });
        });
      } else {
        addNotification(client, notificationMessage, notificationId);
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
        logTabs: [],
        activeTabId: '',
        notifications: [],
        logsOpened: false,
        logsAutoScroll: false,
        openedVersion: {
          runtimeName: '',
          versionName: '',
          __typename: 'OpenedVersion'
        },
        userSettings: {
          selectedUserIds: [],
          userSelection: UserSelection.NONE,
          filters: {
            email: null,
            accessLevel: null,
            __typename: 'UserSettingsFilters'
          },
          __typename: 'UserSettings'
        }
      }
    };

    const client = new ApolloClient({
      cache,
      link,
      typeDefs,
      resolvers: {
        Mutation: {
          addNotification: addNotificationResolver,
          removeNotification: removeNotificationResolver,
          updateTabFilters: updateTabFiltersResolver,
          addLogTab: addLogTabResolver
        }
      }
    });

    // Sets initial cache
    cache.writeData(defaultCache);

    client.onResetStore(async () => {
      cache.writeData(defaultCache);
    });

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
