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
      cookieExpirationTime
    }
  }
`;

export const UPDATE_COOKIE_EXP_TIME = gql`
  mutation UpdateSettings($input: SettingsInput!) {
    updateSettings(input: $input) {
      errors {
        code
        message
      }
      settings {
        cookieExpirationTime
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
