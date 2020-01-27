import gql from 'graphql-tag';

export const NODE_STATUS_UPDATE_SUBSCRIPTION = gql`
  subscription VersionNodeStatus($versionId: ID!) {
    versionNodeStatus(versionId: $versionId) {
      date
      nodeId
      status
      message
    }
  }
`;
