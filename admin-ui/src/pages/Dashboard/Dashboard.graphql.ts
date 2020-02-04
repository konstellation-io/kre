import gql from 'graphql-tag';
import { Runtime } from '../../graphql/models';

export interface GetRuntimesResponse {
  runtimes: Runtime[];
}

export const GET_RUNTIMES = gql`
  query GetRuntimes {
    runtimes {
      id
      name
      status
      creationDate
      publishedVersion {
        status
      }
    }
  }
`;
