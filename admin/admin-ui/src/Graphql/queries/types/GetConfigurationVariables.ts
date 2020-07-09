/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  VersionStatus,
  ConfigurationVariableType
} from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetConfigurationVariables
// ====================================================

export interface GetConfigurationVariables_version_config_vars {
  __typename: 'ConfigurationVariable';
  key: string;
  value: string;
  type: ConfigurationVariableType;
}

export interface GetConfigurationVariables_version_config {
  __typename: 'VersionConfig';
  vars: GetConfigurationVariables_version_config_vars[];
}

export interface GetConfigurationVariables_version {
  __typename: 'Version';
  id: string;
  status: VersionStatus;
  config: GetConfigurationVariables_version_config;
}

export interface GetConfigurationVariables {
  version: GetConfigurationVariables_version;
}

export interface GetConfigurationVariablesVariables {
  versionId: string;
}
