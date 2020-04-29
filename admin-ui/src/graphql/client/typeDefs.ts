import gql from 'graphql-tag';

export enum AccessLevel {
  VIEWER = 'VIEWER',
  MANAGER = 'MANAGER',
  ADMINISTRATOR = 'ADMINISTRATOR'
}

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  ERROR = 'ERROR'
}

export interface AddNotificationInput {
  id: string;
  message: string;
  type: NotificationType;
  timeout: number;
  to: string;
}

export interface LogPanelFilters {
  dateOption: string;
  startDate: string;
  endDate: string;
  __typename: 'logTabFilters';
}

export interface SetCurrentLogPanelInput {
  runtimeId: string;
  nodeId: string;
  nodeName: string;
  workflowId: string;
  uniqueId?: string;
  filters?: LogPanelFilters;
}

export interface LogPanel extends SetCurrentLogPanelInput {
  __typename: string;
}

export interface RemoveNotificationInput {
  id: string;
}

const typeDefs = gql`
  extend type Query {
    notifications: [Notification!]!
  }

  extend type Mutation {
    addNotification(input: AddNotificationInput!): [Notification!]!
    removeNotification(input: RemoveNotificationInput!): [Notification!]!
  }

  extend type Notification {
    id: ID!
    message: String!
    type: NotificationType!
    to: String!
    timeout: Number!
  }

  extend type AddNotificationInput {
    id: ID!
    message: String!
    type: NotificationType!
    timeout: Number
    to: String!
  }

  extend type RemoveNotificationInput {
    id: ID!
  }

  extend enum NotificationType {
    MESSAGE
    ERROR
  }
`;

export default typeDefs;
