/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SettingsInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateAllowedEmails
// ====================================================

export interface UpdateAllowedEmails_updateSettings {
  __typename: 'Settings';
  authAllowedEmails: string[];
}

export interface UpdateAllowedEmails {
  updateSettings: UpdateAllowedEmails_updateSettings;
}

export interface UpdateAllowedEmailsVariables {
  input: SettingsInput;
}
