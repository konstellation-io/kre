import { gql } from '@apollo/client';

export default gql`
  mutation DeleteApiToken($input: DeleteApiTokenInput!) {
    deleteApiToken(input: $input) {
      id
    }
  }
`;
