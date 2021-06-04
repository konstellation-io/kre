import { gql } from '@apollo/client';

export default gql`
  subscription WatchVersionNodeStatus($versionName: String!) {
    watchNodeStatus(versionName: $versionName) {
      id
      status
    }
  }
`;
