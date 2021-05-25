import { gql } from '@apollo/client';

export default gql`
  mutation UnpublishVersion($input: UnpublishVersionInput!) {
    unpublishVersion(input: $input) {
      id
      status
    }
  }
`;
