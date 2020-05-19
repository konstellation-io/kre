import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import {
  UpdateTabFiltersVariables,
  UpdateTabFiltersInput_newFilters
} from '../mutations/updateTabFilters.graphql';
import {
  GET_LOG_TABS,
  GetLogTabs,
  GetLogTabs_logTabs,
  GetLogTabs_logTabs_filters
} from '../queries/getLogs.graphql';
import { dateFilterOptions } from '../../../pages/Version/pages/Status/LogsPanel/components/Filters/components/DatesFilter/DateFilter';
import moment from 'moment';
import { ProcessSelection } from '../typeDefs';
import { ProcessChip } from '../../../pages/Version/pages/Status/LogsPanel/components/AppliedFilters/AppliedFilters';
import { isEmpty } from 'lodash';

export const defaultFilters: {
  [key: string]: string | ProcessSelection[] | null;
} = {
  dateOption: dateFilterOptions.lastTwentyFourHours,
  startDate: moment()
    .subtract(1, 'day')
    .startOf('day')
    .toISOString(true),
  endDate: moment()
    .endOf('day')
    .toISOString(true),
  search: '',
  processes: [],
  level: null
};

function addFilters(
  tabFilters: GetLogTabs_logTabs_filters,
  newFilters: UpdateTabFiltersInput_newFilters
) {
  return { ...tabFilters, ...newFilters };
}

function removeProcess(processes: string[], processNameToRemove: string) {
  return processes.filter(processName => processName !== processNameToRemove);
}

function getNewProcesses(
  selections: ProcessSelection[],
  { workflowName: targetWorkflow, processName: targetProcessName }: ProcessChip
) {
  return selections.map(selection => {
    if (selection.workflowName !== targetWorkflow) return selection;

    return {
      ...selection,
      processNames: removeProcess(selection.processNames, targetProcessName)
    };
  });
}

function removeFilters(
  filters: GetLogTabs_logTabs_filters,
  filtersToRemove: UpdateTabFiltersInput_newFilters
) {
  if (isEmpty(filtersToRemove)) {
    return { ...filters, ...defaultFilters };
  }

  const newFilters: { [key: string]: string | ProcessSelection[] | null } = {};

  Object.entries(filtersToRemove).forEach(([filter, value]) => {
    const newValue =
      filter === 'processes'
        ? getNewProcesses(filters.processes || [], value)
        : defaultFilters[filter];

    newFilters[filter] = newValue;
  });

  return { ...filters, ...newFilters };
}

export default function updateTabFilters(
  _: any,
  variables: UpdateTabFiltersVariables,
  { cache }: ApolloClient<NormalizedCacheObject>
) {
  const { uniqueId, remove, newFilters } = variables.input;
  const data = cache.readQuery<GetLogTabs>({
    query: GET_LOG_TABS
  });
  const logTabs = data?.logTabs;

  if (logTabs) {
    const updatedTabs = logTabs.map((logTab: GetLogTabs_logTabs) => {
      if (logTab.uniqueId === uniqueId) {
        return {
          ...logTab,
          filters: remove
            ? removeFilters(logTab.filters, newFilters)
            : addFilters(logTab.filters, newFilters)
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
