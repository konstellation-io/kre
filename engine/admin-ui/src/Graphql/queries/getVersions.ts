import { gql } from '@apollo/client';

export default gql`
  query GetVersions {
    versions {
      id
      name
      status
      errors
    }
  }
`;
