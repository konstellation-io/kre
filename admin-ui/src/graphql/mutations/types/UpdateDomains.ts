/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SettingsInput, ErrorCode } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateDomains
// ====================================================

export interface UpdateDomains_updateSettings_errors {
  __typename: 'Error';
  code: ErrorCode;
  message: string;
}

export interface UpdateDomains_updateSettings_settings {
  __typename: 'Settings';
  authAllowedDomains: string[];
}

export interface UpdateDomains_updateSettings {
  __typename: 'UpdateSettingsResponse';
  errors: UpdateDomains_updateSettings_errors[] | null;
  settings: UpdateDomains_updateSettings_settings | null;
}

export interface UpdateDomains {
  updateSettings: UpdateDomains_updateSettings | null;
}

export interface UpdateDomainsVariables {
  input: SettingsInput;
}
