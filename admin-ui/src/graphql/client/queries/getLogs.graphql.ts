import gql from 'graphql-tag';
import { LogLevel } from '../../types/globalTypes';
import { ProcessSelection } from '../typeDefs';

export interface GetLogTabs_logTabs_filters {
  dateOption: string;
  startDate: string;
  endDate: string;
  processes?: ProcessSelection[];
  search?: string;
  level?: LogLevel;
  nodeId?: string;
  nodeName: string;
  workflowId: string;
}

export interface GetLogTabs_logTabs {
  runtimeId: string;
  versionId: string;
  runtimeName: string;
  versionName: string;
  uniqueId: string;
  filters: GetLogTabs_logTabs_filters;
}

export interface GetLogTabs {
  logsOpened: boolean;
  activeTabId: string;
  logTabs: GetLogTabs_logTabs[];
}

export const GET_LOG_TABS = gql`
  {
    logsOpened @client
    logsInFullScreen @client
    activeTabId @client
    logTabs @client {
      runtimeId
      versionId
      runtimeName
      versionName
      uniqueId
      filters {
        nodeId
        search
        nodeName
        workflowId
        dateOption
        startDate
        endDate
        processes {
          workflowName
          processNames
        }
        level
      }
    }
  }
`;
