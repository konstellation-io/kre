/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetMe
// ====================================================

export interface GetMe_me {
  __typename: 'User';
  id: string;
  email: string;
  accessLevel: AccessLevel;
}

export interface GetMe {
  me: GetMe_me | null;
}
