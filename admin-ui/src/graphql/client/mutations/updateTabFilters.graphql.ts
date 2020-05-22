import gql from 'graphql-tag';
import { LogLevel } from '../../types/globalTypes';
import { NodeSelection } from '../typeDefs';

export interface UpdateTabFiltersInput_newFilters {
  dateOption?: string;
  startDate?: string;
  endDate?: string;
  nodes?: NodeSelection[] | null;
  search?: string;
  levels?: LogLevel[];
}

export interface UpdateTabFiltersInput {
  tabId: string;
  remove?: boolean;
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
