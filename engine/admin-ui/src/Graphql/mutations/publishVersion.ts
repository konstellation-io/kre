import { gql } from '@apollo/client';

export default gql`
  mutation PublishVersion($input: PublishVersionInput!) {
    publishVersion(input: $input) {
      id
      status
      publicationAuthor {
        email
        id
      }
    }
  }
`;
