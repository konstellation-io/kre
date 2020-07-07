/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  CreateRuntimeInput,
  RuntimeStatus,
  VersionStatus
} from '../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: CreateRuntime
// ====================================================

export interface CreateRuntime_createRuntime_creationAuthor {
  __typename: 'User';
  id: string;
  email: string;
}

export interface CreateRuntime_createRuntime_publishedVersion {
  __typename: 'Version';
  status: VersionStatus;
}

export interface CreateRuntime_createRuntime {
  __typename: 'Runtime';
  id: string;
  name: string;
  description: string;
  status: RuntimeStatus;
  creationDate: string;
  creationAuthor: CreateRuntime_createRuntime_creationAuthor;
  publishedVersion: CreateRuntime_createRuntime_publishedVersion | null;
}

export interface CreateRuntime {
  createRuntime: CreateRuntime_createRuntime;
}

export interface CreateRuntimeVariables {
  input: CreateRuntimeInput;
}
