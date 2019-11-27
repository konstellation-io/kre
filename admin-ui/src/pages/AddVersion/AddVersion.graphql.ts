import gql from 'graphql-tag';

export const ADD_VERSION = gql`
  mutation UploadVersion($name: String, $type: String!, $file: Upload!) {
    uploadVersion(name: $name, type: $type, file: $file) {
      success
    }
  }
`;
