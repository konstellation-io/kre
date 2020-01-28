import gql from 'graphql-tag';

export const ADD_VERSION = gql`
  mutation CreateVersion($input: CreateVersionInput!) {
    createVersion(input: $input) {
      errors {
        code
        message
      }
      version {
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
  }
`;
