/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetLogsFilter
// ====================================================

export interface GetLogsFilter_logs_logs {
  __typename: 'NodeLog';
  date: string;
  nodeName: string | null;
  message: string;
  level: LogLevel;
}

export interface GetLogsFilter_logs {
  __typename: 'LogPage';
  logs: GetLogsFilter_logs_logs[];
  cursor: string | null;
}

export interface GetLogsFilter {
  logs: GetLogsFilter_logs;
}

export interface GetLogsFilterVariables {
  cursor?: string | null;
  startDate: string;
  endDate: string;
  runtimeId: string;
  workflowId: string;
  nodeId?: string | null;
  search?: string | null;
  level?: LogLevel | null;
}
