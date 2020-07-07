/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AccessLevel} from '../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetAccessLevel
// ====================================================

export interface GetAccessLevel_me {
  __typename: 'User';
  accessLevel: AccessLevel;
}

export interface GetAccessLevel {
  me: GetAccessLevel_me | null;
}
