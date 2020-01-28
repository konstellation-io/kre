import gql from 'graphql-tag';

export const GET_LOGS_SUBSCRIPTION = gql`
  subscription GetLogs($runtimeId: ID!, $nodeId: ID!) {
    nodeLogs(runtimeId: $runtimeId, nodeId: $nodeId) {
      date
      type
      versionId
      nodeId
      podId
      message
      level
    }
  }
`;
