import gql from 'graphql-tag';
import { Runtime, Version } from '../../graphql/models';

export interface GetRuntimeResponse {
  runtime: Runtime;
}

export interface GetRuntimeVars {
  runtimeId?: string;
}

export const GET_RUNTIME = gql`
  query GetRuntime($runtimeId: ID!) {
    runtime(id: $runtimeId) {
      name
      activeVersion {
        name
        creationDate
        creationAuthor {
          email
        }
        activationDate
        activationAuthor {
          email
        }
        status
      }
    }
  }
`;

export interface GetVersionConfStatusResponse {
  version: Version;
}

export interface GetVersionConfStatusVars {
  versionId?: string;
}

export const GET_VERSION_CONF_STATUS = gql`
  query GetVersionConfStatus($versionId: ID!) {
    version(id: $versionId) {
      configurationCompleted
    }
  }
`;
