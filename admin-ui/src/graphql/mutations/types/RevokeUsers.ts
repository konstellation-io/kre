/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UsersInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: RevokeUsers
// ====================================================

export interface RevokeUsers_revokeUsers {
  __typename: 'User';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  dateAdded: string;
  lastAccess: string;
}

export interface RevokeUsers {
  revokeUsers: RevokeUsers_revokeUsers[];
}

export interface RevokeUsersVariables {
  input: UsersInput;
}
