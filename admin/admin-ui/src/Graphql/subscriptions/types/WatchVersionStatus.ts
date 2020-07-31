/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VersionStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: WatchVersionStatus
// ====================================================

export interface WatchVersionStatus_watchVersionStatus {
  __typename: 'Version';
  id: string;
  status: VersionStatus;
}

export interface WatchVersionStatus {
  watchVersionStatus: WatchVersionStatus_watchVersionStatus;
}
