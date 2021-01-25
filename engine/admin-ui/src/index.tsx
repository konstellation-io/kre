// import 'wdyr';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { ApolloLink, split } from 'apollo-link';
import { ErrorResponse, onError } from 'apollo-link-error';
import {
  Notification,
  NotificationType
} from 'Graphql/client/models/Notification';

import App from './App';
import ROUTE from 'Constants/routes';
import React from 'react';
import ReactDOM from 'react-dom';
import { WebSocketLink } from '@apollo/client/link/ws';
import cache from 'Graphql/client/cache';
import config from './config';
import { createUploadLink } from 'apollo-upload-client';
import { get } from 'lodash';
import { getMainDefinition } from 'apollo-utilities';
import history from './browserHistory';
import { loader } from 'graphql.macro';
import useNotifications from 'Graphql/hooks/useNotifications';

const extensionsSchema = loader('extensions.graphql');

export let API_BASE_URL: string;

const UNAUTHORIZED_CODE = 'unauthorized';
const INVALID_SESSION_CODE = 'invalid_session';

function userIsUnauthorized(error: ErrorResponse) {
  return get(error, 'networkError.result.code') === UNAUTHORIZED_CODE;
}

function sessionIsInvalid(error: ErrorResponse) {
  return get(error, 'networkError.result.code') === INVALID_SESSION_CODE;
}

function getNotificationIdAndMessage(error: ErrorResponse) {
  let notificationId = Date.now().toString();

  let notificationMessage;

  if (error.networkError) {
    if (sessionIsInvalid(error)) {
      notificationMessage = 'Your session has expired, please log in again';
    } else if (!userIsUnauthorized(error)) {
      notificationMessage = `${error.networkError.message}`;
    }
  } else if (error.graphQLErrors) {
    notificationMessage = error.response
      ? `${get(error, 'response.errors')[0].message}`
      : 'unknown graphQL error';
  }

  return [notificationId, notificationMessage];
}

const { addNotification } = useNotifications();
function addErrorNotification(
  notificationMessage?: string,
  notificationId?: string
) {
  if (notificationMessage !== undefined && notificationId !== undefined) {
    const newNotification: Notification = {
      id: notificationId,
      message: notificationMessage,
      type: NotificationType.ERROR,
      timeout: 0,
      typeLabel: null,
      to: ''
    };

    addNotification(newNotification);
  }
}

config
  .then(envVariables => {
    API_BASE_URL = envVariables.API_BASE_URL;

    const API_BASE_URL_WS = envVariables.API_BASE_URL.replace('http', 'ws');

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
            addErrorNotification(notificationMessage, notificationId);
          });
        });
      } else {
        addErrorNotification(notificationMessage, notificationId);
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
      // @ts-ignore   FIXME: wait for an update to fix this
      wsLink,
      uploadLink
    );

    const link = ApolloLink.from([errorLink, transportLink]);

    const client = new ApolloClient({
      cache,
      // @ts-ignore   FIXME: SAME AS PREV ERROR, wait for an update to fix this
      link,
      typeDefs: extensionsSchema
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
