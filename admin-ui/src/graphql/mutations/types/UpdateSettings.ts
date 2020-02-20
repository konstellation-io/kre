/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SettingsInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateSettings
// ====================================================

export interface UpdateSettings_updateSettings {
  __typename: 'Settings';
  sessionLifetimeInDays: number;
}

export interface UpdateSettings {
  updateSettings: UpdateSettings_updateSettings;
}

export interface UpdateSettingsVariables {
  input: SettingsInput;
}
