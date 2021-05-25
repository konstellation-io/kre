import { gql } from '@apollo/client';

export default gql`
  mutation UpdateVersionConfiguration($input: UpdateConfigurationInput!) {
    updateVersionConfiguration(input: $input) {
      id
      config {
        completed
        vars {
          key
          value
          type
        }
      }
      status
    }
  }
`;
