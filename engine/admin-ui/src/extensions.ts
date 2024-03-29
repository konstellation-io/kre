import { gql } from '@apollo/client';

export default gql`
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
    timeout: Int!
  }

  extend type AddNotificationInput {
    id: ID!
    message: String!
    type: NotificationType!
    timeout: Int
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
