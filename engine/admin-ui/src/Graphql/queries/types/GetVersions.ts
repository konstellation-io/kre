/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VersionStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetVersions
// ====================================================

export interface GetVersions_versions {
  __typename: 'Version';
  id: string;
  name: string;
  status: VersionStatus;
  errors: string[];
}

export interface GetVersions {
  versions: GetVersions_versions[];
}

export interface GetVersionsVariables {
  runtimeId: string;
}
