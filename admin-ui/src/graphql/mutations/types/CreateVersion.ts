/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateVersionInput, VersionStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: CreateVersion
// ====================================================

export interface CreateVersion_createVersion_creationAuthor {
  __typename: 'User';
  id: string;
  email: string;
}

export interface CreateVersion_createVersion {
  __typename: 'Version';
  id: string;
  name: string;
  description: string;
  status: VersionStatus;
  creationDate: string;
  creationAuthor: CreateVersion_createVersion_creationAuthor;
}

export interface CreateVersion {
  createVersion: CreateVersion_createVersion;
}

export interface CreateVersionVariables {
  input: CreateVersionInput;
}
