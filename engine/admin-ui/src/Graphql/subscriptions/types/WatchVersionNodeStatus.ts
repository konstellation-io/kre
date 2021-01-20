/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NodeStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: WatchVersionNodeStatus
// ====================================================

export interface WatchVersionNodeStatus_watchNodeStatus {
  __typename: 'Node';
  id: string;
  status: NodeStatus;
}

export interface WatchVersionNodeStatus {
  watchNodeStatus: WatchVersionNodeStatus_watchNodeStatus;
}

export interface WatchVersionNodeStatusVariables {
  versionId: string;
}
