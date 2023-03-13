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
// GraphQL mutation operation: UpdateVersionUserConfiguration
// ====================================================

export interface UpdateVersionUserConfiguration_updateVersionUserConfiguration_config_vars {
  __typename: 'ConfigurationVariable';
  key: string;
  value: string;
  type: ConfigurationVariableType;
}

export interface UpdateVersionUserConfiguration_updateVersionUserConfiguration_config {
  __typename: 'VersionUserConfig';
  completed: boolean;
  vars: UpdateVersionUserConfiguration_updateVersionUserConfiguration_config_vars[];
}

export interface UpdateVersionUserConfiguration_updateVersionUserConfiguration {
  __typename: 'Version';
  id: string;
  config: UpdateVersionUserConfiguration_updateVersionUserConfiguration_config;
  status: VersionStatus;
}

export interface UpdateVersionUserConfiguration {
  updateVersionUserConfiguration: UpdateVersionUserConfiguration_updateVersionUserConfiguration;
}

export interface UpdateVersionUserConfigurationVariables {
  input: UpdateConfigurationInput;
}
