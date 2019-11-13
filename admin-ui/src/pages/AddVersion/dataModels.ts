import gql from 'graphql-tag';

export const ADD_VERSION = gql`
  mutation AddVersion($name: String!) {
    addVersion(name: $name) {
      success
      message
    }
  }
`;
