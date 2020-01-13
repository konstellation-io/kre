import gql from 'graphql-tag';
import { Version, ConfigurationVariable } from '../../../../graphql/models';

export interface GetConfigurationVariablesResponse {
  version: Version;
}

export interface GetConfigurationVariablesVars {
  versionId?: string;
}

export const GET_CONFIGURATION_VARIABLES = gql`
  query GetConfigurationVariables($versionId: ID!) {
    version(id: $versionId) {
      configurationVariables {
        key
        value
        type
      }
    }
  }
`;

export interface UpdateVersionConfigurationVars {
  input: {
    versionId: string;
    configurationVariables: ConfigurationVariable[];
  };
}

export const UPDATE_VERSION_CONFIGURATION = gql`
  mutation UpdateVersionConfiguration($input: UpdateConfigurationInput!) {
    updateVersionConfiguration(input: $input) {
      configurationVariables {
        key
        value
        type
      }
    }
  }
`;
