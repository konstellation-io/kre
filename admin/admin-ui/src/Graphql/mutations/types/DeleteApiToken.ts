/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteApiToken
// ====================================================

export interface DeleteApiToken_deleteApiToken_apiToken {
  __typename: 'ApiToken';
  creationDate: string;
  lastActivity: string | null;
}

export interface DeleteApiToken_deleteApiToken {
  __typename: 'User';
  id: string;
  apiToken: DeleteApiToken_deleteApiToken_apiToken | null;
}

export interface DeleteApiToken {
  deleteApiToken: DeleteApiToken_deleteApiToken;
}
