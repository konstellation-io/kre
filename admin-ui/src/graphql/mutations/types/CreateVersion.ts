/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  CreateVersionInput,
  ErrorCode,
  VersionStatus
} from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: CreateVersion
// ====================================================

export interface CreateVersion_createVersion_errors {
  __typename: 'Error';
  code: ErrorCode;
  message: string;
}

export interface CreateVersion_createVersion_version_creationAuthor {
  __typename: 'User';
  id: string;
  email: string;
}

export interface CreateVersion_createVersion_version {
  __typename: 'Version';
  id: string;
  name: string;
  description: string;
  status: VersionStatus;
  creationDate: string;
  creationAuthor: CreateVersion_createVersion_version_creationAuthor;
}

export interface CreateVersion_createVersion {
  __typename: 'CreateVersionResponse';
  errors: CreateVersion_createVersion_errors[] | null;
  version: CreateVersion_createVersion_version;
}

export interface CreateVersion {
  createVersion: CreateVersion_createVersion;
}

export interface CreateVersionVariables {
  input: CreateVersionInput;
}
