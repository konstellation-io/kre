import { gql } from '@apollo/client';

export default gql`
  query GetConfigurationVariables($versionName: String!) {
    version(name: $versionName) {
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
