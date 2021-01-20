/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VersionStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: WatchVersion
// ====================================================

export interface WatchVersion_watchVersion {
  __typename: 'Version';
  id: string;
  status: VersionStatus;
  errors: string[];
}

export interface WatchVersion {
  watchVersion: WatchVersion_watchVersion;
}
