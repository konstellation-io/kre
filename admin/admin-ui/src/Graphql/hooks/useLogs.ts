import {
  LogPanel,
  LogPanelFilters,
  NodeSelection
} from 'Graphql/client/typeDefs';
import { activeTabId, logTabs, logsOpened } from 'Graphql/client/cache';
import { cloneDeep, findIndex, isEqual, omit } from 'lodash';

import { LogLevel } from 'Graphql/types/globalTypes';
import { dateFilterOptions } from 'Pages/Version/pages/Status/LogsPanel/components/Filters/components/DatesFilter/DateFilter';
import moment from 'moment';

type AddLogsTabVariables = {
  runtimeId: string;
  runtimeName: string;
  versionId: string;
  versionName: string;
  nodes: NodeSelection[];
};

export interface UpdateTabFiltersVariables_newFilters {
  dateOption?: string;
  startDate?: string;
  endDate?: string;
  nodes?: NodeSelection[] | null;
  search?: string;
  levels?: LogLevel[];
}

type UpdateTabFiltersVariables = {
  tabId: string;
  newFilters: UpdateTabFiltersVariables_newFilters;
};

/*
 * `uniqueId` and `startDate` are not taken into account because they are
 * generated each time a tab is created and are time dependant.
 */
function getComparableLogTabFields(logTab: LogPanel) {
  return {
    ...omit(logTab, 'uniqueId'),
    filters: omit(logTab.filters, 'startDate')
  };
}

/*
 * Compare log tabs to check if `logTab` has already been opened.
 */
function findLogTab(tabs: LogPanel[], logTab: LogPanel) {
  return tabs.findIndex(actLogTab =>
    isEqual(
      getComparableLogTabFields(actLogTab),
      getComparableLogTabFields(logTab)
    )
  );
}

function getUniqueId() {
  return `${Date.now()}`;
}

export const defaultFilters: {
  [key: string]: string | NodeSelection[] | null;
} = {
  dateOption: dateFilterOptions.lastTwentyFourHours,
  endDate: null,
  search: '',
  nodes: [],
  levels: null
};

export function getDefaultFilters(): LogPanelFilters {
  return {
    ...defaultFilters,
    startDate: moment()
      .subtract(24, 'hour')
      .toISOString(),
    __typename: 'logTabFilters'
  };
}

function useLogs() {
  function openLogs() {
    logsOpened(true);
  }
  function closeLogs() {
    logsOpened(false);
  }
  function toggleLogs() {
    logsOpened(!logsOpened());
  }

  function getNewActiveTabId(index: number, newTabs: LogPanel[]) {
    const tabs = logTabs();
    const actActiveTabId = activeTabId();
    let newActiveTabId = actActiveTabId;

    const isRemovingSelectedTab = tabs[index].uniqueId === actActiveTabId;

    if (isRemovingSelectedTab) {
      newActiveTabId = newTabs[Math.max(0, index - 1)]?.uniqueId || '';
    }

    return newActiveTabId;
  }

  function openTab(tabIdOrIdx: string | number) {
    const tabs = logTabs();

    if (typeof tabIdOrIdx === 'string') activeTabId(tabIdOrIdx);
    else activeTabId(tabs[tabIdOrIdx].uniqueId);
  }

  function closeTab(idx: number) {
    const tabs = [...logTabs()];
    tabs.splice(idx, 1);

    activeTabId(getNewActiveTabId(idx, tabs));
    logTabs(tabs);
  }

  function closeOtherTabs(idx: number) {
    const tabs = [...logTabs()];
    const newActiveTabId = tabs[idx].uniqueId;

    activeTabId(newActiveTabId);
    logTabs([tabs[idx]]);
  }

  function duplicateTab(idx: number) {
    const tabs = logTabs();
    logTabs([...tabs, { ...tabs[idx], uniqueId: getUniqueId() }]);
  }

  function addTab(newTab: LogPanel) {
    const logTabsList = logTabs();

    logTabs([...logTabsList, newTab]);
  }

  function createLogsTab(newTabInfo: AddLogsTabVariables) {
    const logTabsList = logTabs();

    const newLogTabId = getUniqueId();

    const { nodes, ...baseFields } = newTabInfo;
    const newLogTab: LogPanel = {
      ...baseFields,
      uniqueId: newLogTabId,
      filters: {
        ...getDefaultFilters(),
        nodes
      } as LogPanelFilters
    };

    const tabIndex = findLogTab(logTabsList, newLogTab);

    if (tabIndex === -1) {
      addTab(newLogTab);
      openTab(newLogTabId);
    } else {
      openTab(tabIndex);
    }

    openLogs();
  }

  function initializeLogsPanel(tabInfo: LogPanel) {
    logsOpened(true);
    activeTabId(tabInfo.uniqueId);
    logTabs([tabInfo]);
  }

  function updateTabFilters({ tabId, newFilters }: UpdateTabFiltersVariables) {
    const logTabsList = cloneDeep(logTabs());

    const tabIdx = findIndex(logTabsList, t => t.uniqueId === tabId);
    logTabsList[tabIdx].filters = {
      ...logTabsList[tabIdx].filters,
      ...newFilters
    } as LogPanelFilters;

    logTabs(logTabsList);
  }

  function resetTabFilters(tabId: string) {
    updateTabFilters({
      tabId,
      newFilters: getDefaultFilters() as UpdateTabFiltersVariables_newFilters
    });
  }

  return {
    initializeLogsPanel,
    openLogs,
    closeLogs,
    toggleLogs,
    createLogsTab,
    updateTabFilters,
    resetTabFilters,
    openTab,
    closeTab,
    closeOtherTabs,
    duplicateTab
  };
}

export default useLogs;
