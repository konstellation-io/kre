import gql from 'graphql-tag';
import { Settings } from '../../graphql/models';
export interface SettingsResponse {
  settings: Settings;
}

export interface SettingsVars {
  input: Settings;
}

export const GET_DOMAINS = gql`
  query GetDomains {
    settings {
      authAllowedDomains
    }
  }
`;

export const GET_EXPIRATION_TIME = gql`
  query GetSettings {
    settings {
      sessionLifetimeInDays
    }
  }
`;

export const UPDATE_SESSION_LIFETIME = gql`
  mutation UpdateSettings($input: SettingsInput!) {
    updateSettings(input: $input) {
      errors {
        code
        message
      }
      settings {
        sessionLifetimeInDays
      }
    }
  }
`;

export const UPDATE_DOMAINS = gql`
  mutation UpdateDomains($input: SettingsInput!) {
    updateSettings(input: $input) {
      errors {
        code
        message
      }
      settings {
        authAllowedDomains
      }
    }
  }
`;
