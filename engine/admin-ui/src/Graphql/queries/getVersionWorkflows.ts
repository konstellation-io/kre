import { gql } from '@apollo/client';

export default gql`
  query GetVersionWorkflows($versionName: String!) {
    version(name: $versionName) {
      id
      name
      status
      creationDate
      workflows {
        id
        name
        nodes {
          id
          name
          status
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
