import gql from 'graphql-tag';
import { AddNotificationInput } from '../typeDefs';

export interface AddNotification_addNotification {
  __typename: 'Notification';
  id: string;
  message: string;
}

export interface AddNotification {
  addNotification: AddNotification_addNotification[];
}

export interface AddNotificationVariables {
  input: AddNotificationInput;
}

export const ADD_NOTIFICATION = gql`
  mutation AddNotification($input: AddNotificationInput!) {
    addNotification(input: $input) @client {
      id
      message
    }
  }
`;
