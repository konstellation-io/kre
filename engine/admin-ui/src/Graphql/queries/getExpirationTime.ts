import { gql } from '@apollo/client';

export default gql`
  query GetSettings {
    settings {
      sessionLifetimeInDays
    }
  }
`;
