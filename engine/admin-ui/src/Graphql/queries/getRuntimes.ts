import { gql } from '@apollo/client';

export default gql`
  query GetRuntimes {
    runtimes {
      id
      name
      description
      creationDate
      publishedVersion {
        status
      }
    }
  }
`;
