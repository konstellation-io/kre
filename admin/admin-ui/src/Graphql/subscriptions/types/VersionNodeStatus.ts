/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {NodeStatus} from '../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: VersionNodeStatus
// ====================================================

export interface VersionNodeStatus_watchNodeStatus {
  __typename: 'Node';
  id: string;
  status: NodeStatus;
}

export interface VersionNodeStatus {
  watchNodeStatus: VersionNodeStatus_watchNodeStatus;
}

export interface VersionNodeStatusVariables {
  versionId: string;
}
