/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SettingsInput, ErrorCode } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateSettings
// ====================================================

export interface UpdateSettings_updateSettings_errors {
  __typename: 'Error';
  code: ErrorCode;
  message: string;
}

export interface UpdateSettings_updateSettings_settings {
  __typename: 'Settings';
  sessionLifetimeInDays: number;
}

export interface UpdateSettings_updateSettings {
  __typename: 'UpdateSettingsResponse';
  errors: UpdateSettings_updateSettings_errors[] | null;
  settings: UpdateSettings_updateSettings_settings | null;
}

export interface UpdateSettings {
  updateSettings: UpdateSettings_updateSettings | null;
}

export interface UpdateSettingsVariables {
  input: SettingsInput;
}
