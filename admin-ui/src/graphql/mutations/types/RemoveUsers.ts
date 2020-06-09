/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UsersInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: RemoveUsers
// ====================================================

export interface RemoveUsers_removeUsers {
  __typename: 'User';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  creationDate: string;
  lastAccess: string;
}

export interface RemoveUsers {
  removeUsers: RemoveUsers_removeUsers[];
}

export interface RemoveUsersVariables {
  input: UsersInput;
}
