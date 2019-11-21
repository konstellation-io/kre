import gql from 'graphql-tag';

export const ADD_RUNTIME = gql`
  mutation AddRuntime($name: String!) {
    createRuntime(name: $name) {
      success
      message
    }
  }
`;
