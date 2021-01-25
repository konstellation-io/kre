import { Notification } from 'Graphql/client/models/Notification';
import { gql } from '@apollo/client';

export interface GetLoginAndNotifications_notifications extends Notification {
  __typename: 'Notification';
}

export interface GetLoginAndNotifications {
  notifications: GetLoginAndNotifications_notifications[];
  loggedIn: boolean;
}

export const GET_LOGIN_AND_NOTIFICATIONS = gql`
  query GetNotifications {
    loggedIn @client
    notifications @client {
      id
      message
      timeout
      type
      typeLabel
      to
    }
  }
`;
