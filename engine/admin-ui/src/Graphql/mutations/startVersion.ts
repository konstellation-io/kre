import { gql } from '@apollo/client';

export default gql`
  mutation StartVersion($input: StartVersionInput!) {
    startVersion(input: $input) {
      id
      status
    }
  }
`;
