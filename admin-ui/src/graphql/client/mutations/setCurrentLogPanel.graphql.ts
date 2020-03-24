import gql from 'graphql-tag';

export const SET_CURRENT_LOG_PANEL = gql`
  mutation SetCurrentLogPanel($input: SetCurrentLogPanelInput!) {
    setCurrentLogPanel(input: $input) @client {
      runtimeId
      nodeId
      nodeName
    }
  }
`;
