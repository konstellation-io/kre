import gql from 'graphql-tag';
import {
  Version,
  Error,
  ConfigurationVariable
} from '../../../../graphql/models';

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
        variable
        value
        type
      }
    }
  }
`;

export interface UpdateVersionConfigurationVars {
  input: {
    id: string;
    configurationVariables: ConfigurationVariable[];
  };
}

export interface UpdateVersionConfigurationResponse {
  errors: Error[];
  version: Version;
}

export const UPDATE_VERSION_CONFIGURATION = gql`
  mutation UpdateVersionConfiguration($input: UpdateConfigurationInput!) {
    updateVersionConfiguration(input: $input) {
      errors {
        code
        message
      }
      version {
        configurationVariables {
          variable
          value
          type
        }
      }
    }
  }
`;
