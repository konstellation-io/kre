import gql from 'graphql-tag';

interface RuntimeResponse {
  success: boolean;
  message: string;
}

export interface AddRuntimeData {
  addRuntime: RuntimeResponse;
}

export interface AddRuntimeVars {
  name: string;
}

export const ADD_RUNTIME = gql`
  mutation AddRuntime($name: String!) {
    createRuntime(name: $name) {
      success
      message
    }
  }
`;
