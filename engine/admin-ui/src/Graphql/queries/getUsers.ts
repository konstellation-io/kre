import { gql } from '@apollo/client';

export default gql`
  query GetUsers {
    users {
      id
      email
      accessLevel
      creationDate
      lastActivity
      activeSessions
    }
  }
`;
