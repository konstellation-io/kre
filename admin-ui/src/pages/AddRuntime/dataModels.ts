import gql from 'graphql-tag';

export const ADD_RUNTIME = gql`
  mutation AddRuntime($name: String!) {
    addRuntime(name: $name) {
      success
      message
    }
  }
`;
