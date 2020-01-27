import gql from 'graphql-tag';
import { Runtime, Version } from '../../graphql/models';

export interface GetRuntimeAndVersionsResponse {
  runtime: Runtime;
  versions: [Version];
}

export interface GetRuntimeAndVersionsVars {
  runtimeId?: string;
}

export const GET_RUNTIME_AND_VERSIONS = gql`
  query GetVersionConfStatus($runtimeId: ID!) {
    runtime(id: $runtimeId) {
      id
      name
      status
    }

    versions(runtimeId: $runtimeId) {
      id
      name
      description
      status
      creationDate
      creationAuthor {
        id
        email
      }
      activationDate
      activationAuthor {
        id
        email
      }
      configurationCompleted
    }
  }
`;
