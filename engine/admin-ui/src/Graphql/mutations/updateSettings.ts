import { gql } from '@apollo/client';

export default gql`
  mutation UpdateSettings($input: SettingsInput!) {
    updateSettings(input: $input) {
      sessionLifetimeInDays
    }
  }
`;
