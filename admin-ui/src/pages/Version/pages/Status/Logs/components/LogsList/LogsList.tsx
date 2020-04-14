import { get } from 'lodash';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loader } from 'graphql.macro';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { GET_LOGS } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import LogItem from './LogItem';
import { GetServerLogs_logs_items } from '../../../../../../../graphql/queries/types/GetServerLogs';
import styles from './LogsList.module.scss';
import {
  GetServerLogs,
  GetServerLogsVariables
} from '../../../../../../../graphql/queries/types/GetServerLogs';
import moment from 'moment';
import LoadMore from './LoadMore';
import SpinnerLinear from '../../../../../../../components/LoadingComponents/SpinnerLinear/SpinnerLinear';
import { LocalState } from '../../../../../../..';
import { FilterTypes } from '../LogsTab/LogsTab';
const GetLogsSubscription = loader(
  '../../../../../../../graphql/subscriptions/getLogsSubscription.graphql'
);
const GetServerLogsQuery = loader(
  '../../../../../../../graphql/queries/getServerLogs.graphql'
);

type GetFiltersParams = {
  runtimeId: string;
  nodeId: string;
};
function getFilters({ runtimeId, nodeId }: GetFiltersParams) {
  return {
    workflowId: '',
    cursor: '',
    runtimeId,
    nodeId
  };
}

function scrollToBottom(component: HTMLDivElement) {
  if (component) {
    component.scrollTo({
      top: component.scrollHeight,
      behavior: 'smooth'
    });
  }
}

type Props = {
  nodeId: string;
  runtimeId: string;
  workflowId?: string;
  filterValues: FilterTypes;
};

function LogsList({ nodeId, runtimeId, workflowId = '', filterValues }: Props) {
  const [nextPage, setNextPage] = useState<string>('');
  const client = useApolloClient();
  const listRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<Function | null>(null);

  const { data: localData } = useQuery<LocalState>(GET_LOGS);
  const logs: GetServerLogs_logs_items[] = localData?.logs || [];

  const { loading, refetch, fetchMore, subscribeToMore } = useQuery<
    GetServerLogs,
    GetServerLogsVariables
  >(GetServerLogsQuery, {
    variables: { workflowId, runtimeId, nodeId, ...filterValues },
    onCompleted: data => {
      client.writeData({ data: { logs: [...data.logs.items.reverse()] } });
      setNextPage(data.logs.cursor || '');
      handleSubscription();
    },
    onError: handleSubscription,
    fetchPolicy: 'no-cache'
  });

  // Subscription query
  const subscribe = () =>
    subscribeToMore({
      document: GetLogsSubscription,
      variables: { runtimeId, nodeId },
      updateQuery: (prev, { subscriptionData }) => {
        const newLog = get(subscriptionData.data, 'nodeLogs');
        const logs = client.readQuery({ query: GET_LOGS });

        client.writeData({ data: { logs: [...logs.logs, newLog] } });

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
    if (localData?.logsAutoScroll && listRef.current !== null) {
      scrollToBottom(listRef.current);
    }
  }, [localData, listRef]);

  useEffect(() => {
    handleScroll();
  }, [logs, localData?.logsAutoScroll]);

  useEffect(() => {
    refetch({ ...getFilters({ runtimeId, nodeId }), ...filterValues });
    // Ignore refetch dependency, we do not want to refetch when refetch func changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, runtimeId]);

  if (loading) return <SpinnerLinear />;

  // Pagination query
  function loadPreviousLogs() {
    fetchMore({
      variables: {
        ...getFilters({ runtimeId, nodeId }),
        cursor: nextPage
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const newData = fetchMoreResult && fetchMoreResult.logs;

        if (newData) {
          client.writeData({
            data: { logs: [...newData.items.reverse(), ...logs] }
          });
          setNextPage(newData.cursor || '');
        }

        return prev;
      }
    });
  }

  const logElements = logs.map((log: GetServerLogs_logs_items) => (
    <LogItem {...log} key={log.id} />
  ));
  return (
    <div
      ref={listRef}
      className={styles.listContainer}
      id="VersionLogsListContainer"
    >
      {nextPage && <LoadMore onClick={loadPreviousLogs} />}
      {logElements}
    </div>
  );
}

export default LogsList;
