import gql from 'graphql-tag';
import { TabFilters } from '../queries/getLogs.graphql';

export interface UpdateTabFiltersInput {
  uniqueId: string;
  newFilters: TabFilters;
}

export interface UpdateTabFiltersVariables {
  input: UpdateTabFiltersInput;
}
export interface UpdateTabFilters {
  updateTabFilters: string[];
}
export const UPDATE_TAB_FILTERS = gql`
  mutation UpdateTabFilters($input: UpdateTabFiltersVariables!) {
    updateTabFilters(input: $input) @client {
      filters
    }
  }
`;
