import gql from 'graphql-tag';

interface Version {
  id: number;
  model: string;
  year: number;
  stock: number;
}

export const GET_VERSIONS = gql`
  query GetVersions {
    versions {
      versionNumber
      description
      status
      creationDate
      creatorName
      activationDate
      activatorName
    }
  }
`;
