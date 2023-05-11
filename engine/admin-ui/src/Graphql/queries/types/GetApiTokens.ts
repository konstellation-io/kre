/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetApiTokens
// ====================================================

export interface GetApiTokens_me_apiTokens {
  __typename: 'APIToken';
  id: string;
  name: string;
  creationDate: string;
  lastActivity: string | null;
}

export interface GetApiTokens_me {
  __typename: 'User';
  id: string;
  apiTokens: GetApiTokens_me_apiTokens[];
}

export interface GetApiTokens {
  me: GetApiTokens_me | null;
}
