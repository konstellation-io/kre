/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogFilters, LogLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: GetLogs
// ====================================================

export interface GetLogs_watchNodeLogs {
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

export interface GetLogs {
  watchNodeLogs: GetLogs_watchNodeLogs;
}

export interface GetLogsVariables {
  filters: LogFilters;
  runtimeId: string;
  versionId: string;
}
