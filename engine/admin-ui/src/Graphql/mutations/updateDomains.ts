import { gql } from '@apollo/client';

export default gql`
  mutation UpdateDomains($input: SettingsInput!) {
    updateSettings(input: $input) {
      authAllowedDomains
    }
  }
`;
