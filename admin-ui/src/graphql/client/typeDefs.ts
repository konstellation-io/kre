import gql from 'graphql-tag';
import { AccessLevel } from '../types/globalTypes';

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

export interface AddLogTabInput {
  runtimeId: string;
  runtimeName: string;
  versionId: string;
  versionName: string;
  nodes: NodeSelection[];
}

export interface NodeSelection {
  workflowName: string;
  nodeNames: string[];
  __typename: string;
}

export interface LogPanelFilters {
  dateOption?: string;
  startDate?: string;
  endDate?: string;
  nodes?: NodeSelection[];
  search?: string;
  levels?: string[] | null;
  __typename: 'logTabFilters';
}

export interface SetCurrentLogPanelInput {
  runtimeId: string;
  runtimeName: string;
  versionId: string;
  versionName: string;
  uniqueId?: string;
  filters?: LogPanelFilters;
}

export interface LogPanel extends SetCurrentLogPanelInput {
  __typename: string;
}

export interface OpenedVersion {
  runtimeName: string;
  versionName: string;
  __typename: 'OpenedVersion';
}

export interface UserSettingsFilters {
  email: string | null;
  accessLevel: AccessLevel | null;
  __typename: 'UserSettingsFilters';
}

export enum UserSelection {
  ALL,
  INDETERMINATE,
  NONE
}

export interface UserSettings {
  selectedUserIds: string[];
  userSelection: UserSelection;
  filters: UserSettingsFilters;
  __typename: 'UserSettings';
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
