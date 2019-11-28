import gql from 'graphql-tag';
import { Runtime } from '../../graphql/models';

export interface AddRuntimeResponse {
  addRuntime: {
    errors?: string[];
    runtime: Runtime;
  };
}

export interface AddRuntimeVars {
  input: {
    name: string;
  };
}

export const ADD_RUNTIME = gql`
  mutation CreateRuntime($input: CreateRuntimeInput!) {
    createRuntime(input: $input) {
      errors {
        code
        message
      }
      runtime {
        name
      }
    }
  }
`;
