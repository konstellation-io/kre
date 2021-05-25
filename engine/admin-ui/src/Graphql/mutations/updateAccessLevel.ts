import { gql } from '@apollo/client';

export default gql`
  mutation UpdateAccessLevel($input: UpdateAccessLevelInput!) {
    updateAccessLevel(input: $input) {
      id
      email
      accessLevel
      creationDate
      lastActivity
    }
  }
`;
