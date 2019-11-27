import gql from 'graphql-tag';
import { Settings } from '../../graphql/models';
export interface SettingsResponse {
  settings: Settings;
}
export const GET_DOMAINS = gql`
  query GetDomains {
    settings {
      authAllowedDomains
    }
  }
`;
export const ADD_ALLOWED_DOMAIN = gql`
  mutation AddAllowedDomain($domainName: String!) {
    addAllowedDomain(domainName: $domainName) {
      authAllowedDomains
    }
  }
`;
export const REMOVE_ALLOWED_DOMAIN = gql`
  mutation RemoveAllowedDomain($domainName: String!) {
    removeAllowedDomain(domainName: $domainName) {
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
export const UPDATE_EXPIRATION_TIME = gql`
  mutation UpdateExpirationTime($input: SettingsInput) {
    setSettings(input: $input) {
      cookieExpirationTime
    }
  }
`;
