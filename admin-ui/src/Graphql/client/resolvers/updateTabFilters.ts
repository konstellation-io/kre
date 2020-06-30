import {
  GET_LOG_TABS,
  GetLogTabs,
  GetLogTabs_logTabs
} from '../queries/getLogs.graphql';
import { LogPanelFilters, NodeSelection } from '../typeDefs';
import {
  UpdateTabFiltersInput_newFilters,
  UpdateTabFiltersVariables
} from '../mutations/updateTabFilters.graphql';

import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { dateFilterOptions } from 'Pages/Version/pages/Status/LogsPanel/components/Filters/components/DatesFilter/DateFilter';
import moment from 'moment';

export const defaultFilters: {
  [key: string]: string | NodeSelection[] | null;
} = {
  dateOption: dateFilterOptions.lastTwentyFourHours,
  endDate: null,
  search: '',
  nodes: [],
  levels: null
};

export function getDefaultFilters():
  | LogPanelFilters
  | UpdateTabFiltersInput_newFilters {
  return {
    ...defaultFilters,
    startDate: moment()
      .subtract(24, 'hour')
      .toISOString(),
    __typename: 'logTabFilters'
  };
}

export default function updateTabFilters(
  _: any,
  variables: UpdateTabFiltersVariables,
  { cache }: ApolloClient<NormalizedCacheObject>
) {
  const { tabId, newFilters } = variables.input;
  const data = cache.readQuery<GetLogTabs>({
    query: GET_LOG_TABS
  });
  const logTabs = data?.logTabs;

  if (logTabs) {
    const updatedTabs = logTabs.map((logTab: GetLogTabs_logTabs) => {
      if (logTab.uniqueId === tabId) {
        return {
          ...logTab,
          filters: newFilters
        };
      }
      return logTab;
    });

    cache.writeData({
      data: {
        logTabs: updatedTabs
      }
    });
  }

  return null;
}
