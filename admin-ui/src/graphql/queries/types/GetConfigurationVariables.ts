/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  VersionStatus,
  ConfigurationVariableType
} from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetConfigurationVariables
// ====================================================

export interface GetConfigurationVariables_version_configurationVariables {
  __typename: 'ConfigurationVariable';
  key: string;
  value: string;
  type: ConfigurationVariableType;
}

export interface GetConfigurationVariables_version {
  __typename: 'Version';
  status: VersionStatus;
  configurationVariables: GetConfigurationVariables_version_configurationVariables[];
}

export interface GetConfigurationVariables {
  version: GetConfigurationVariables_version;
}

export interface GetConfigurationVariablesVariables {
  versionId: string;
}
