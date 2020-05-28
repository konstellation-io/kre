import { isEqual, omit } from 'lodash';
import {
  GET_LOG_TABS,
  GetLogTabs,
  GetLogTabs_logTabs,
  GetLogTabs_logTabs_filters
} from '../queries/getLogs.graphql';
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { getDefaultFilters } from './updateTabFilters';
import { AddLogTabVariables } from '../mutations/addLogTab.graphql';

/*
 * `uniqueId` and `startDate` are not taken into account because they are
 * generated each time a tab is created and are time dependant.
 */
function getComparableLogTabFields(logTab: GetLogTabs_logTabs) {
  return {
    ...omit(logTab, 'uniqueId'),
    filters: omit(logTab.filters, 'startDate')
  };
}

/*
 * Compare log tabs to check if `logTab` has already been opened.
 */
function findLogTab(logTabs: GetLogTabs_logTabs[], logTab: GetLogTabs_logTabs) {
  return logTabs.findIndex(actLogTab =>
    isEqual(
      getComparableLogTabFields(actLogTab),
      getComparableLogTabFields(logTab)
    )
  );
}

export default function addLogTab(
  _: any,
  variables: AddLogTabVariables,
  { cache }: ApolloClient<NormalizedCacheObject>
) {
  const {
    runtimeId,
    runtimeName,
    versionId,
    versionName,
    nodes
  } = variables.input;
  const logTabs =
    cache.readQuery<GetLogTabs>({
      query: GET_LOG_TABS
    })?.logTabs || [];

  const newLogTabId = `${Date.now()}`;
  const newLogTab = {
    runtimeId,
    runtimeName,
    versionId,
    versionName,
    uniqueId: newLogTabId,
    filters: {
      ...getDefaultFilters(),
      nodes
    } as GetLogTabs_logTabs_filters,
    __typename: 'logTab'
  };

  const tabIndex = findLogTab(logTabs, newLogTab);

  if (tabIndex === -1) {
    cache.writeData({
      data: {
        logsOpened: true,
        activeTabId: newLogTabId,
        logTabs: [...logTabs, newLogTab]
      }
    });
  } else {
    cache.writeData({
      data: {
        logsOpened: true,
        activeTabId: logTabs[tabIndex].uniqueId
      }
    });
  }

  return null;
}
