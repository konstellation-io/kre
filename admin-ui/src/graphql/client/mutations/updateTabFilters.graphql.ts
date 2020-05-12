import gql from 'graphql-tag';
import { LogLevel } from '../../types/globalTypes';
import { ProcessSelection } from '../typeDefs';

export interface UpdateTabFiltersInput_newFilters {
  dateOption?: string;
  startDate?: string;
  endDate?: string;
  processes?: ProcessSelection[] | null;
  search?: string;
  level?: LogLevel;
}

export interface UpdateTabFiltersInput {
  uniqueId: string;
  newFilters: UpdateTabFiltersInput_newFilters;
}

export interface UpdateTabFiltersVariables {
  input: UpdateTabFiltersInput;
}
export interface UpdateTabFilters {
  updateTabFilters: UpdateTabFiltersInput_newFilters;
}
export const UPDATE_TAB_FILTERS = gql`
  mutation UpdateTabFilters($input: UpdateTabFiltersVariables!) {
    updateTabFilters(input: $input) @client
  }
`;
