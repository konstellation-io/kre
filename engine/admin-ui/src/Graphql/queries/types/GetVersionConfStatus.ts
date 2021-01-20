/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RuntimeStatus, VersionStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetVersionConfStatus
// ====================================================

export interface GetVersionConfStatus_runtime_creationAuthor {
  __typename: 'User';
  id: string;
  email: string;
}

export interface GetVersionConfStatus_runtime {
  __typename: 'Runtime';
  id: string;
  name: string;
  description: string;
  status: RuntimeStatus;
  creationDate: string;
  creationAuthor: GetVersionConfStatus_runtime_creationAuthor;
  measurementsUrl: string;
  databaseUrl: string;
  entrypointAddress: string;
}

export interface GetVersionConfStatus_versions_creationAuthor {
  __typename: 'User';
  id: string;
  email: string;
}

export interface GetVersionConfStatus_versions_publicationAuthor {
  __typename: 'User';
  id: string;
  email: string;
}

export interface GetVersionConfStatus_versions_config {
  __typename: 'VersionConfig';
  completed: boolean;
}

export interface GetVersionConfStatus_versions {
  __typename: 'Version';
  id: string;
  name: string;
  description: string;
  status: VersionStatus;
  creationDate: string;
  creationAuthor: GetVersionConfStatus_versions_creationAuthor;
  publicationDate: string | null;
  publicationAuthor: GetVersionConfStatus_versions_publicationAuthor | null;
  config: GetVersionConfStatus_versions_config;
  hasDoc: boolean | null;
  errors: string[];
}

export interface GetVersionConfStatus {
  runtime: GetVersionConfStatus_runtime;
  versions: GetVersionConfStatus_versions[];
}

export interface GetVersionConfStatusVariables {
  runtimeId: string;
}
