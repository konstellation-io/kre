import gql from 'graphql-tag';

export const GET_LOG_PANEL_CONF = gql`
  {
    logsAutoScroll @client
  }
`;

export const GET_LOG_TABS = gql`
  {
    logsOpened @client
    activeTabId @client
    logTabs @client {
      runtimeId
      nodeId
      nodeName
      uniqueId
      workflowId
    }
  }
`;
