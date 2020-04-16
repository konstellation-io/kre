import gql from 'graphql-tag';

export const GET_LOGS = gql`
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
    }
  }
`;
