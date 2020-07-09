/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateAccessLevelInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateAccessLevel
// ====================================================

export interface UpdateAccessLevel_updateAccessLevel {
  __typename: 'User';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  creationDate: string;
  lastActivity: string | null;
}

export interface UpdateAccessLevel {
  updateAccessLevel: UpdateAccessLevel_updateAccessLevel[];
}

export interface UpdateAccessLevelVariables {
  input: UpdateAccessLevelInput;
}
