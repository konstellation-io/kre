import { gql } from '@apollo/client';

export default gql`
  query GetAccessLevel {
    me {
      accessLevel
    }
  }
`;
