import { gql } from '@apollo/client';

export default gql`
  mutation CreateRuntime($input: CreateRuntimeInput!) {
    createRuntime(input: $input) {
      id
      name
      description
      creationDate
      creationAuthor {
        id
        email
      }
      publishedVersion {
        status
      }
    }
  }
`;
