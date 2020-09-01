import { LogLevel } from '../../types/globalTypes';
import { NodeSelection } from '../typeDefs';
import { gql } from '@apollo/client';

export interface GetLogTabs_logTabs_filters {
  dateOption: string;
  startDate: string;
  endDate: string;
  nodes?: NodeSelection[];
  search?: string;
  levels?: LogLevel[];
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
    activeTabId @client
    logTabs @client {
      runtimeId
      versionId
      runtimeName
      versionName
      uniqueId
      filters {
        search
        dateOption
        startDate
        endDate
        nodes {
          workflowName
          nodeNames
        }
        levels
      }
    }
  }
`;
