/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  UpdateConfigurationInput,
  ConfigurationVariableType
} from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateVersionConfiguration
// ====================================================

export interface UpdateVersionConfiguration_updateVersionConfiguration_configurationVariables {
  __typename: 'ConfigurationVariable';
  key: string;
  value: string;
  type: ConfigurationVariableType;
}

export interface UpdateVersionConfiguration_updateVersionConfiguration {
  __typename: 'Version';
  configurationVariables: UpdateVersionConfiguration_updateVersionConfiguration_configurationVariables[];
}

export interface UpdateVersionConfiguration {
  updateVersionConfiguration: UpdateVersionConfiguration_updateVersionConfiguration;
}

export interface UpdateVersionConfigurationVariables {
  input: UpdateConfigurationInput;
}
