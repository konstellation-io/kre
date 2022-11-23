import { gql } from '@apollo/client';

export default gql`
  subscription WatchVersionNodeStatus($versionName: String!, $runtimeId: ID!) {
    watchNodeStatus(versionName: $versionName, runtimeId: $runtimeId) {
      id
      name
      status
    }
  }
`;
