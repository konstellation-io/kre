/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UsersInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: RevokeUserSessions
// ====================================================

export interface RevokeUserSessions_revokeUserSessions {
  __typename: 'User';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  creationDate: string;
  lastAccess: string;
}

export interface RevokeUserSessions {
  revokeUserSessions: RevokeUserSessions_revokeUserSessions[];
}

export interface RevokeUserSessionsVariables {
  input: UsersInput;
}
