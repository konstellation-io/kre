import gql from 'graphql-tag';

interface RuntimeVersion {
  id: number;
  model: string;
  year: number;
  stock: number;
}

export interface RuntimeVersionsData {
  runtimeVersion: RuntimeVersion[];
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
