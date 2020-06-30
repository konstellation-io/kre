import gql from 'graphql-tag';
import { AddLogTabInput } from '../typeDefs';

export interface AddLogTabVariables {
  input: AddLogTabInput;
}

export const ADD_LOG_TAB = gql`
  mutation AddLogTab($input: AddLogTabInput!) {
    addLogTab(input: $input) @client
  }
`;
