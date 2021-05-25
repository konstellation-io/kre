import { gql } from '@apollo/client';

export default gql`
  query GetApiTokens {
    me {
      id
      apiTokens {
        id
        name
        creationDate
        lastActivity
      }
    }
  }
`;
