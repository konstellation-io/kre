import gql from 'graphql-tag';
import { Version } from '../../../../graphql/models';

export interface RuntimeVersionsResponse {
  versions: Version[];
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
      activationAuthor
    }
  }
`;
