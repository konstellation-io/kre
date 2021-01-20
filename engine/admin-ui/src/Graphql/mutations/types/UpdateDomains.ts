/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SettingsInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateDomains
// ====================================================

export interface UpdateDomains_updateSettings {
  __typename: 'Settings';
  authAllowedDomains: string[];
}

export interface UpdateDomains {
  updateSettings: UpdateDomains_updateSettings;
}

export interface UpdateDomainsVariables {
  input: SettingsInput;
}
