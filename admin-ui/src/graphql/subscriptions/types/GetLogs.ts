/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: GetLogs
// ====================================================

export interface GetLogs_nodeLogs {
  __typename: 'NodeLog';
  date: string;
  type: string;
  versionId: string;
  nodeId: string;
  podId: string;
  message: string;
  level: string;
}

export interface GetLogs {
  nodeLogs: GetLogs_nodeLogs;
}

export interface GetLogsVariables {
  runtimeId: string;
  nodeId: string;
}
