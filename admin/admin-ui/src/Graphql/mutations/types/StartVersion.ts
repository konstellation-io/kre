/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {StartVersionInput, VersionStatus} from '../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: StartVersion
// ====================================================

export interface StartVersion_startVersion {
  __typename: 'Version';
  id: string;
  status: VersionStatus;
}

export interface StartVersion {
  startVersion: StartVersion_startVersion;
}

export interface StartVersionVariables {
  input: StartVersionInput;
}
