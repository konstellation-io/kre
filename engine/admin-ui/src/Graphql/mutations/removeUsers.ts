import { gql } from '@apollo/client';

export default gql`
  mutation RemoveUsers($input: UsersInput!) {
    removeUsers(input: $input) {
      id
      email
      accessLevel
      creationDate
      lastActivity
    }
  }
`;
