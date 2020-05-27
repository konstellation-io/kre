import { get } from 'lodash';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import { GetLogTabs_logTabs_filters } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import LogItem from './LogItem';
import LogListHeader from './LogListHeader';
import { GetServerLogs_logs_items } from '../../../../../../../graphql/queries/types/GetServerLogs';
import styles from './LogsList.module.scss';
import {
  GetServerLogs,
  GetServerLogsVariables
} from '../../../../../../../graphql/queries/types/GetServerLogs';
import moment from 'moment';
import LogsFooter from '../LogsFooter/LogsFooter';
import { LogFilters } from '../../../../../../../graphql/types/globalTypes';
import useWorkflowsAndNodes from '../../../../../../../hooks/useWorkflowsAndNodes';
import SpinnerCircular from '../../../../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import {
  GetLogTabs,
  GET_LOGS_OPENED
} from '../../../../../../../graphql/client/queries/getLogsOpened.graphql';
const GetLogsSubscription = loader(
  '../../../../../../../graphql/subscriptions/getLogsSubscription.graphql'
);
const GetServerLogsQuery = loader(
  '../../../../../../../graphql/queries/getServerLogs.graphql'
);

function scrollToBottom(component: HTMLDivElement) {
  if (component) {
    component.scrollTo({
      top: component.scrollHeight,
      behavior: 'smooth'
    });
  }
}

function getLogsQueryFilters(
  filterValues: GetLogTabs_logTabs_filters,
  nodeNameToId: Map<string, string>
) {
  return {
    startDate: filterValues.startDate,
    endDate: filterValues.startDate,
    search: filterValues.search,
    levels: filterValues.levels,
    nodeIds:
      filterValues?.nodes
        ?.map(({ workflowName, nodeNames }) =>
          nodeNames.map(nodeName =>
            nodeNameToId.get(`${workflowName}${nodeName}`)
          )
        )
        .flat() || []
  } as LogFilters;
}

type Props = {
  runtimeId: string;
  versionId: string;
  filterValues: GetLogTabs_logTabs_filters;
  onNewLogs: Function;
  logs: GetServerLogs_logs_items[];
  clearLogs: () => void;
};

function LogsList({
  runtimeId,
  versionId,
  filterValues,
  logs,
  onNewLogs,
  clearLogs
}: Props) {
  const { data: localData } = useQuery<GetLogTabs>(GET_LOGS_OPENED);
  const logsOpened = localData?.logsOpened;

  const { nodeNameToId } = useWorkflowsAndNodes(versionId);
  const [autoScrollActive, setAutoScrollActive] = useState(false);
  const [nextPage, setNextPage] = useState<string>('');
  const listRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<Function | null>(null);
  const [refetching, setRefetching] = useState(false);
  const [noMoreData, setNoMoreData] = useState(false);

  const formatFilters = (filters: GetLogTabs_logTabs_filters) =>
    getLogsQueryFilters(filters, nodeNameToId);

  const { loading, fetchMore, subscribeToMore } = useQuery<
    GetServerLogs,
    GetServerLogsVariables
  >(GetServerLogsQuery, {
    variables: {
      runtimeId,
      versionId,
      filters: formatFilters(filterValues)
    },
    onCompleted: data => {
      onNewLogs(data.logs.items.reverse());
      updateCursor(data.logs.cursor || '');
      handleSubscription();
    },
    onError: handleSubscription,
    fetchPolicy: 'no-cache'
  });

  function updateCursor(newCursor: string) {
    setNextPage(newCursor);
    setNoMoreData(newCursor ? false : true);
  }

  function toggleAutoScrollActive() {
    setAutoScrollActive(!autoScrollActive);
  }

  // Subscription query
  const subscribe = () =>
    subscribeToMore({
      document: GetLogsSubscription,
      variables: {
        runtimeId,
        versionId,
        filters: formatFilters(filterValues)
      },
      updateQuery: (prev, { subscriptionData }) => {
        const newLog = get(subscriptionData.data, 'nodeLogs');
        onNewLogs((oldLogs: GetServerLogs_logs_items[]) => [
          ...oldLogs,
          newLog
        ]);
        return prev;
      }
    });

  function handleSubscription() {
    const { endDate } = filterValues;
    if (moment().isBefore(endDate)) {
      unsubscribeRef.current && unsubscribeRef.current();
      unsubscribeRef.current = subscribe();
    }
  }

  const handleScroll = useCallback(() => {
    if (autoScrollActive && listRef.current !== null) {
      scrollToBottom(listRef.current);
    }
  }, [autoScrollActive, listRef]);

  useEffect(handleScroll, [logs, autoScrollActive]);

  // Pagination query
  function loadPreviousLogs() {
    setRefetching(true);
    fetchMore({
      variables: {
        runtimeId,
        versionId,
        filters: formatFilters(filterValues),
        cursor: nextPage
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const newData = fetchMoreResult && fetchMoreResult.logs;

        if (newData) {
          onNewLogs((oldLogs: GetServerLogs_logs_items[]) => [
            ...newData.items.reverse(),
            ...oldLogs
          ]);
        }

        updateCursor(newData?.cursor || '');
        setRefetching(false);
        return prev;
      }
    });
  }

  const logElements = logs.map((log: GetServerLogs_logs_items) => (
    <LogItem {...log} key={log.id} />
  ));
  return (
    <>
      <LogListHeader />
      {loading && logsOpened && (
        <div className={styles.spinner}>
          <SpinnerCircular size={100} />
        </div>
      )}
      <div ref={listRef} className={styles.listContainer}>
        {logElements}
      </div>
      <LogsFooter
        clearLogs={clearLogs}
        loadMore={loadPreviousLogs}
        toggleAutoScrollActive={toggleAutoScrollActive}
        autoScrollActive={autoScrollActive}
        loading={loading || refetching}
        noMoreData={noMoreData}
      />
    </>
  );
}

export default LogsList;
