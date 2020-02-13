/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { StopVersionInput, VersionStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: StopVersion
// ====================================================

export interface StopVersion_stopVersion {
  __typename: 'Version';
  id: string;
  status: VersionStatus;
}

export interface StopVersion {
  stopVersion: StopVersion_stopVersion;
}

export interface StopVersionVariables {
  input: StopVersionInput;
}
