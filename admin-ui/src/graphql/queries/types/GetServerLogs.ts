/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetServerLogs
// ====================================================

export interface GetServerLogs_logs_items {
  __typename: 'NodeLog';
  id: string;
  date: string;
  nodeName: string | null;
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
  cursor?: string | null;
  startDate: string;
  endDate: string;
  runtimeId: string;
  workflowId: string;
  nodeId?: string | null;
  search?: string | null;
  level?: LogLevel | null;
}
