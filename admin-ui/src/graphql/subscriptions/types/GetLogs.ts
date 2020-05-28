/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogFilters, LogLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: GetLogs
// ====================================================

export interface GetLogs_nodeLogs {
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
  nodeLogs: GetLogs_nodeLogs;
}

export interface GetLogsVariables {
  filters: LogFilters;
  runtimeId: string;
  versionId: string;
}
