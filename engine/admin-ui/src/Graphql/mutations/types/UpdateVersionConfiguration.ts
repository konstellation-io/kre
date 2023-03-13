/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  UpdateConfigurationInput,
  ConfigurationVariableType,
  VersionStatus,
} from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateVersionConfiguration
// ====================================================

export interface UpdateVersionConfiguration_updateVersionUserConfiguration_config_vars {
  __typename: 'ConfigurationVariable';
  key: string;
  value: string;
  type: ConfigurationVariableType;
}

export interface UpdateVersionConfiguration_updateVersionUserConfiguration_config {
  __typename: 'VersionUserConfig';
  completed: boolean;
  vars: UpdateVersionConfiguration_updateVersionUserConfiguration_config_vars[];
}

export interface UpdateVersionConfiguration_updateVersionUserConfiguration {
  __typename: 'Version';
  id: string;
  config: UpdateVersionConfiguration_updateVersionUserConfiguration_config;
  status: VersionStatus;
}

export interface UpdateVersionConfiguration {
  updateVersionUserConfiguration: UpdateVersionConfiguration_updateVersionUserConfiguration;
}

export interface UpdateVersionConfigurationVariables {
  input: UpdateConfigurationInput;
}
