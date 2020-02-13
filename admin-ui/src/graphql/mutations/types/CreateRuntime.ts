/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  CreateRuntimeInput,
  ErrorCode,
  RuntimeStatus,
  VersionStatus
} from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: CreateRuntime
// ====================================================

export interface CreateRuntime_createRuntime_errors {
  __typename: 'Error';
  code: ErrorCode;
  message: string;
}

export interface CreateRuntime_createRuntime_runtime_creationAuthor {
  __typename: 'User';
  id: string;
  email: string;
}

export interface CreateRuntime_createRuntime_runtime_publishedVersion {
  __typename: 'Version';
  status: VersionStatus;
}

export interface CreateRuntime_createRuntime_runtime {
  __typename: 'Runtime';
  id: string;
  name: string;
  status: RuntimeStatus;
  creationDate: string;
  creationAuthor: CreateRuntime_createRuntime_runtime_creationAuthor;
  publishedVersion: CreateRuntime_createRuntime_runtime_publishedVersion | null;
}

export interface CreateRuntime_createRuntime {
  __typename: 'CreateRuntimeResponse';
  errors: CreateRuntime_createRuntime_errors[] | null;
  runtime: CreateRuntime_createRuntime_runtime | null;
}

export interface CreateRuntime {
  createRuntime: CreateRuntime_createRuntime;
}

export interface CreateRuntimeVariables {
  input: CreateRuntimeInput;
}
