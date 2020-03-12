import gql from 'graphql-tag';
import { RemoveNotificationInput } from '../typeDefs';

export interface RemoveNotification_removeNotification {
  __typename: 'Notification';
  id: string;
  message: string;
}

export interface RemoveNotification {
  addNotification: RemoveNotification_removeNotification[];
}

export interface RemoveNotificationVariables {
  input: RemoveNotificationInput;
}

export const REMOVE_NOTIFICATION = gql`
  mutation RemoveNotification($input: RemoveNotificationInput!) {
    removeNotification(input: $input) @client {
      id
      message
    }
  }
`;
