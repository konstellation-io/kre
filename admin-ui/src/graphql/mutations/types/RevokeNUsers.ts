/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UsersInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: RevokeNUsers
// ====================================================

export interface RevokeNUsers_revokeUsers {
  __typename: 'User';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  dateAdded: string;
  lastAccess: string;
}

export interface RevokeNUsers {
  revokeUsers: RevokeNUsers_revokeUsers[];
}

export interface RevokeNUsersVariables {
  input: UsersInput;
}
