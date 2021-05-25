import { gql } from '@apollo/client';

export default gql`
  mutation CreateVersion($input: CreateVersionInput!) {
    createVersion(input: $input) {
      id
      name
      description
      status
      creationDate
      creationAuthor {
        id
        email
      }
    }
  }
`;
