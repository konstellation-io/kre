import gql from 'graphql-tag';
import { Runtime } from '../../graphql/models';

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
