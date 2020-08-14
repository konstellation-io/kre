import {
  GET_LOGS_OPENED,
  GetLogTabs
} from 'Graphql/client/queries/getLogsOpened.graphql';
import { GetLogs, GetLogsVariables } from 'Graphql/subscriptions/types/GetLogs';
import {
  GetServerLogs,
  GetServerLogsVariables
} from 'Graphql/queries/types/GetServerLogs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SpinnerCircular, SpinnerLinear } from 'kwc';
import { Virtuoso, VirtuosoMethods } from 'react-virtuoso';

import { GetLogTabs_logTabs_filters } from 'Graphql/client/queries/getLogs.graphql';
import { GetServerLogs_logs_items } from 'Graphql/queries/types/GetServerLogs';
import { LogFilters } from 'Graphql/types/globalTypes';
import LogItem from './LogItem';
import LogListHeader from './LogListHeader';
import LogsFooter from '../LogsFooter/LogsFooter';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import styles from './LogsList.module.scss';
import { useQuery } from '@apollo/react-hooks';
import useWorkflowsAndNodes from 'Hooks/useWorkflowsAndNodes';

const WatchNodeLogs = loader('Graphql/subscriptions/watchNodeLogs.graphql');
const GetServerLogsQuery = loader('Graphql/queries/getServerLogs.graphql');

const LOG_HEIGHT = 25;
const SCROLL_THRESHOLD = 8 * LOG_HEIGHT;

function getLogsQueryFilters(
  filterValues: GetLogTabs_logTabs_filters,
  nodeNameToId: Map<string, string>
) {
  return {
    startDate: filterValues.startDate,
    endDate: filterValues.endDate,
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
  const virtuoso = useRef<VirtuosoMethods>(null);
  const [openedLogs, setOpenedLogs] = useState<boolean[]>([]);

  const { data: localData } = useQuery<GetLogTabs>(GET_LOGS_OPENED);
  const logsOpened = localData?.logsOpened;

  const { nodeNameToId } = useWorkflowsAndNodes(versionId);
  const [autoScrollActive, setAutoScrollActive] = useState(true);
  const [nextPage, setNextPage] = useState<string>('');
  const listRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<Function | null>(null);
  const [refetching, setRefetching] = useState(false);

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
      setNextPage(data.logs.cursor || '');
      handleSubscription();
      setOpenedLogs(new Array(data.logs.items.length).fill(false));
    },
    onError: handleSubscription,
    fetchPolicy: 'no-cache'
  });

  function toggleAutoScrollActive() {
    setAutoScrollActive(!autoScrollActive);
  }

  // Subscription query
  const subscribe = () =>
    subscribeToMore<GetLogs, GetLogsVariables>({
      document: WatchNodeLogs,
      variables: {
        runtimeId,
        versionId,
        filters: formatFilters(filterValues)
      },
      updateQuery: (prev, { subscriptionData }) => {
        const newLog = get(subscriptionData.data, 'watchNodeLogs');
        onNewLogs((oldLogs: GetServerLogs_logs_items[]) => [
          ...oldLogs,
          newLog
        ]);
        return prev;
      }
    });

  function handleSubscription() {
    const { endDate } = filterValues;
    if (endDate === null) {
      unsubscribeRef.current && unsubscribeRef.current();
      unsubscribeRef.current = subscribe();
    }
  }

  useEffect(() => {
    if (autoScrollActive && virtuoso.current && logs.length !== 0) {
      try {
        virtuoso.current.scrollToIndex({
          index: logs.length - 1,
          align: 'end'
        });
      } catch (err) {
        // virtuoso component not yet prepared
      }
    }
  }, [autoScrollActive, logs.length]);

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

          setOpenedLogs([
            ...new Array(newData.items.length).fill(false),
            ...openedLogs
          ] as boolean[]);

          virtuoso.current?.adjustForPrependedItems(newData.items.length);
        }

        setNextPage(newData?.cursor || '');
        setRefetching(false);
        return prev;
      }
    });
  }

  function handleOnScroll() {
    const list = listRef?.current?.childNodes[0] as HTMLDivElement;
    if (virtuoso.current && list) {
      const hasReachedThreshold = list.scrollTop <= SCROLL_THRESHOLD;
      if (hasReachedThreshold && nextPage !== '' && !(loading || refetching)) {
        loadPreviousLogs();
      }
    }
  }

  let logElements = null;

  const toggleOpenedLog = useCallback(
    (index: number) => {
      openedLogs[index] = !openedLogs[index];
      setOpenedLogs(openedLogs);
    },
    [openedLogs, setOpenedLogs]
  );

  if (logs.length) {
    logElements = (
      <Virtuoso
        ref={virtuoso}
        initialTopMostItemIndex={logs.length - 1}
        totalCount={logs.length}
        item={index => {
          const log = logs[index];
          return (
            <LogItem
              {...log}
              key={log.id}
              index={index}
              toggleOpen={toggleOpenedLog}
              opened={openedLogs[index]}
            />
          );
        }}
        style={{ height: '100%', width: '100%' }}
        followOutput={autoScrollActive}
      />
    );
  }

  return (
    <>
      <LogListHeader />
      {loading && logsOpened && (
        <div className={styles.spinner}>
          <SpinnerCircular size={100} />
        </div>
      )}
      {refetching && (
        <div className={styles.loadMoreSpinner}>
          <div>Loading</div>
          <div className={styles.spinner}>
            <SpinnerLinear size={50} />
          </div>
        </div>
      )}
      <div className={styles.listWrapper}>
        <div
          ref={listRef}
          className={styles.listContainer}
          onScroll={handleOnScroll}
          onWheel={() => (autoScrollActive ? setAutoScrollActive(false) : null)}
        >
          {logElements}
        </div>
      </div>
      <LogsFooter
        clearLogs={clearLogs}
        toggleAutoScrollActive={toggleAutoScrollActive}
        autoScrollActive={autoScrollActive}
      />
    </>
  );
}

export default LogsList;
