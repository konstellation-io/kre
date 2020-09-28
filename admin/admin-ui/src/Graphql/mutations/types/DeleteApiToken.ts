/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DeleteApiTokenInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: DeleteApiToken
// ====================================================

export interface DeleteApiToken_deleteApiToken {
  __typename: 'ApiToken';
  id: string;
}

export interface DeleteApiToken {
  deleteApiToken: DeleteApiToken_deleteApiToken;
}

export interface DeleteApiTokenVariables {
  input: DeleteApiTokenInput;
}
