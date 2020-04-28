import gql from 'graphql-tag';

export interface GetLogPanelConf {
  logsAutoScroll: boolean;
}
export const GET_LOG_PANEL_CONF = gql`
  {
    logsAutoScroll @client
  }
`;

export interface TabFilters {
  dateOption: string;
  startDate: string;
  endDate: string;
}

export interface GetLogTabs_logTabs {
  runtimeId: string;
  nodeId: string;
  nodeName: string;
  workflowId: string;
  uniqueId: string;
  filters: TabFilters;
}

export interface GetLogTabs {
  logsOpened: boolean;
  activeTabId: string;
  logTabs: GetLogTabs_logTabs[];
}

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
      filters {
        dateOption
        startDate
        endDate
      }
    }
  }
`;
