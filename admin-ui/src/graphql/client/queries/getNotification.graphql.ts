import gql from 'graphql-tag';
import { NotificationType } from '../typeDefs';

export interface GetNotifications_notifications {
  __typename: 'Notification';
  id: string;
  message: string;
  timeout: number;
  type: NotificationType;
  to: string;
}

export interface GetNotifications {
  notifications: GetNotifications_notifications[];
}

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications @client {
      id
      message
      timeout
      type
      to
    }
  }
`;
