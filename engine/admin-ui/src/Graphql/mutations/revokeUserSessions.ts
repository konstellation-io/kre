import { gql } from '@apollo/client';

export default gql`
  mutation RevokeUserSessions($input: UsersInput!) {
    revokeUserSessions(input: $input) {
      id
      email
      accessLevel
      creationDate
      lastActivity
      activeSessions
    }
  }
`;
