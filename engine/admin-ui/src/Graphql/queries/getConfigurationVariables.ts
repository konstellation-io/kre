import { gql } from '@apollo/client';

export default gql`
  query GetConfigurationVariables($versionName: String!, $runtimeId: ID!) {
    version(name: $versionName, runtimeId: $runtimeId) {
      id
      status
      config {
        vars {
          key
          value
          type
        }
      }
    }
  }
`;
