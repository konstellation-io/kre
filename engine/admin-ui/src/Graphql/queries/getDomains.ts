import { gql } from '@apollo/client';

export default gql`
  query GetDomains {
    settings {
      authAllowedDomains
    }
  }
`;
