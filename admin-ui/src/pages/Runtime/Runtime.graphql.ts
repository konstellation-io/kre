import gql from 'graphql-tag';
import { Runtime } from '../../graphql/models';

export interface GetRuntimeResponse {
  runtime: Runtime;
}

export const GET_RUNTIME = gql`
  query GetRuntime($runtimeId: ID!) {
    runtime(id: $runtimeId) {
      name
      versions(status: "active") {
        versionNumber
        creationDate
        creatorName
        activationDate
        activationAuthor
      }
    }
  }
`;
