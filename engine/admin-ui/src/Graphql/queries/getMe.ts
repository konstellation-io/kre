import { gql } from '@apollo/client';

export default gql`
  query GetMe {
    me {
      id
      email
      accessLevel
    }
  }
`;
