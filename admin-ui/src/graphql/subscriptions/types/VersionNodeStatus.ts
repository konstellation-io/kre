/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { NodeStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: VersionNodeStatus
// ====================================================

export interface VersionNodeStatus_versionNodeStatus {
  __typename: 'VersionNodeStatus';
  date: string;
  nodeId: string;
  status: NodeStatus;
  message: string;
}

export interface VersionNodeStatus {
  versionNodeStatus: VersionNodeStatus_versionNodeStatus;
}

export interface VersionNodeStatusVariables {
  versionId: string;
}
