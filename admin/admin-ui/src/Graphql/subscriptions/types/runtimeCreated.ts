/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {RuntimeStatus, VersionStatus} from '../../types/globalTypes';

// ====================================================
// GraphQL subscription operation: runtimeCreated
// ====================================================

export interface runtimeCreated_runtimeCreated_publishedVersion {
  __typename: 'Version';
  status: VersionStatus;
}

export interface runtimeCreated_runtimeCreated {
  __typename: 'Runtime';
  id: string;
  name: string;
  status: RuntimeStatus;
  creationDate: string;
  publishedVersion: runtimeCreated_runtimeCreated_publishedVersion | null;
}

export interface runtimeCreated {
  runtimeCreated: runtimeCreated_runtimeCreated;
}
