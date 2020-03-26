/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: GetLogs
// ====================================================

export interface GetLogs_nodeLogs {
  __typename: 'NodeLog';
  date: string;
  nodeName: string | null;
  message: string;
  level: LogLevel;
}

export interface GetLogs {
  nodeLogs: GetLogs_nodeLogs;
}

export interface GetLogsVariables {
  runtimeId: string;
  nodeId: string;
}
