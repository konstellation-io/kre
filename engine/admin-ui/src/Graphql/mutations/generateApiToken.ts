import { gql } from '@apollo/client';

export default gql`
  mutation GenerateApiToken($input: GenerateApiTokenInput!) {
    generateApiToken(input: $input)
  }
`;
