/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RuntimeStatus, VersionStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetRuntimes
// ====================================================

export interface GetRuntimes_runtimes_publishedVersion {
  __typename: 'Version';
  status: VersionStatus;
}

export interface GetRuntimes_runtimes {
  __typename: 'Runtime';
  id: string;
  name: string;
  description: string;
  status: RuntimeStatus;
  creationDate: string;
  publishedVersion: GetRuntimes_runtimes_publishedVersion | null;
}

export interface GetRuntimes {
  runtimes: GetRuntimes_runtimes[];
}
