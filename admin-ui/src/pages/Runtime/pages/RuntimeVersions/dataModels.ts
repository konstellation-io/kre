import gql from 'graphql-tag';

export interface RuntimeVersion {
  description: string;
  status: string;
  creationDate: string;
  creatorName: string;
  activationDate: string;
  activatorName: string;
  versionNumber: string;
}

export interface RuntimeVersionsData {
  versions: RuntimeVersion[];
}

export const GET_VERSIONS = gql`
  query GetVersions($runtimeId: ID!) {
    versions(runtimeId: $runtimeId) {
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
