import { gql } from '@apollo/client';

export default gql`
  query GetVersionWorkflows($versionName: String!, $runtimeId: ID!) {
    version(name: $versionName, runtimeId: $runtimeId) {
      id
      krtVersion
      name
      status
      creationDate
      workflows {
        id
        name
        exitpoint
        nodes {
          id
          name
          status
          subscriptions
          replicas
        }
        edges {
          id
          fromNode
          toNode
        }
      }
      config {
        completed
      }
    }
  }
`;
