import { gql } from '@apollo/client';

export default gql`
    mutation UpdateVersionUserConfiguration($input: UpdateConfigurationInput!) {
        updateVersionUserConfiguration(input: $input) {
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
