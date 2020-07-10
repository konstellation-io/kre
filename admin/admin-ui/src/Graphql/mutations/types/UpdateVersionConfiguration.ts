/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  UpdateConfigurationInput,
  ConfigurationVariableType,
  VersionStatus
} from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateVersionConfiguration
// ====================================================

export interface UpdateVersionConfiguration_updateVersionConfiguration_config_vars {
  __typename: 'ConfigurationVariable';
  key: string;
  value: string;
  type: ConfigurationVariableType;
}

export interface UpdateVersionConfiguration_updateVersionConfiguration_config {
  __typename: 'VersionConfig';
  completed: boolean;
  vars: UpdateVersionConfiguration_updateVersionConfiguration_config_vars[];
}

export interface UpdateVersionConfiguration_updateVersionConfiguration {
  __typename: 'Version';
  id: string;
  config: UpdateVersionConfiguration_updateVersionConfiguration_config;
  status: VersionStatus;
}

export interface UpdateVersionConfiguration {
  updateVersionConfiguration: UpdateVersionConfiguration_updateVersionConfiguration;
}

export interface UpdateVersionConfigurationVariables {
  input: UpdateConfigurationInput;
}
