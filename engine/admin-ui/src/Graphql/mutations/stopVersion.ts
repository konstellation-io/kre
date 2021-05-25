import { gql } from '@apollo/client';

export default gql`
  mutation StopVersion($input: StopVersionInput!) {
    stopVersion(input: $input) {
      id
      status
    }
  }
`;
