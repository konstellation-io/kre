import gql from 'graphql-tag';

export const GET_CURRENT_LOG_PANEL = gql`
  query getCurrentLogPanel {
    logPanel @client {
      runtimeId
      nodeId
      nodeName
    }
  }
`;
