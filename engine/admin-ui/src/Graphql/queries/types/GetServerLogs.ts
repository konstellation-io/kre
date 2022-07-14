/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogFilters, LogLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetServerLogs
// ====================================================

export interface GetServerLogs_logs_items {
  __typename: 'NodeLog';
  id: string;
  date: string;
  nodeId: string | null;
  nodeName: string | null;
  workflowId: string | null;
  workflowName: string | null;
  message: string;
  level: LogLevel;
}

export interface GetServerLogs_logs {
  __typename: 'LogPage';
  items: GetServerLogs_logs_items[];
  cursor: string | null;
}

export interface GetServerLogs {
  logs: GetServerLogs_logs;
}

export interface GetServerLogsVariables {
  runtimeId: string;
  filters: LogFilters;
  cursor?: string | null;
}
