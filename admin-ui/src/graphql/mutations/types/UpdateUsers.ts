/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateUsersInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateUsers
// ====================================================

export interface UpdateUsers_updateUsers {
  __typename: 'User';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  creationDate: string;
  lastAccess: string;
}

export interface UpdateUsers {
  updateUsers: UpdateUsers_updateUsers[];
}

export interface UpdateUsersVariables {
  input: UpdateUsersInput;
}
