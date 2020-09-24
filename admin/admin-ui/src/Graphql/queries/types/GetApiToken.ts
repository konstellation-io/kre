/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetApiToken
// ====================================================

export interface GetApiToken_me_apiToken {
  __typename: 'ApiToken';
  creationDate: string;
  lastActivity: string | null;
}

export interface GetApiToken_me {
  __typename: 'User';
  id: string;
  apiToken: GetApiToken_me_apiToken | null;
}

export interface GetApiToken {
  me: GetApiToken_me | null;
}
