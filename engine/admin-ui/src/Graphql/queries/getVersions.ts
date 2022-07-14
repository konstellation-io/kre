import { gql } from '@apollo/client';

export default gql`
  query GetVersions($runtimeId: ID!) {
    versions(runtimeId: $runtimeId) {
      id
      name
      status
      errors
    }
  }
`;
