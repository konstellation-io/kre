import { get } from 'lodash';

import React, { useEffect, useRef, useState } from 'react';
import { loader } from 'graphql.macro';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { GET_LOGS } from '../../../../../../../graphql/client/queries/getLogs.graphql';

import LogItem from './LogItem';

import { GetLogs_nodeLogs } from '../../../../../../../graphql/subscriptions/types/GetLogs';

import styles from './LogsList.module.scss';
import SpinnerLinear from '../../../../../../../components/LoadingComponents/SpinnerLinear/SpinnerLinear';
import cx from 'classnames';

const GetLogsSubscription = loader(
  '../../../../../../../graphql/subscriptions/getLogsSubscription.graphql'
);
const GetLogsFiltered = loader(
  '../../../../../../../graphql/queries/getLogsFiltered.graphql'
);

type Props = {
  nodeId: string;
  runtimeId: string;
  onUpdate: () => void;
};

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 2).toString();
const now = new Date().toISOString();

function LogsList({ nodeId, onUpdate, runtimeId }: Props) {
  const [nextPage, setNextPage] = useState('');
  const client = useApolloClient();
  const listRef = useRef(null);
  const unsubscribe = useRef<Function | null>(null);

  const { data, subscribeToMore } = useQuery(GET_LOGS);
  const logs = data ? data.logs : [];

  function addLogs(items: GetLogs_nodeLogs[]) {
    client.writeData({
      data: {
        logs: [...items.reverse(), ...logs]
      }
    });
  }

  const filter = {
    startDate: yesterday,
    endDate: now,
    runtimeId: runtimeId,
    workflowId: '',
    nodeId: nodeId,
    cursor: ''
  };

  function loadPreviousLogs() {
    fetchMore({
      variables: {
        ...filter,
        cursor: nextPage
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const prevData = previousResult.logs;
        const newData = fetchMoreResult && fetchMoreResult.logs;

        return {
          logs: {
            ...prevData,
            ...newData
          }
        };
      }
    });
  }

  const { data: serverData, loading, refetch, fetchMore } = useQuery(
    GetLogsFiltered,
    {
      variables: filter,
      onCompleted: () => {
        if (unsubscribe && unsubscribe.current) {
          unsubscribe.current();
        }
        unsubscribe.current = subscribe();
      },
      onError: () => {
        if (unsubscribe && unsubscribe.current) {
          unsubscribe.current();
        }
        unsubscribe.current = subscribe();
      }
    }
  );
  useEffect(() => {
    const logsResponse = serverData;
    const logInfo = get(logsResponse, 'logs.logs', []);
    addLogs(logInfo);

    setNextPage(get(logsResponse, 'logs.cursor', ''));
  }, [serverData]);

  useEffect(() => {
    refetch({
      startDate: yesterday,
      endDate: now,
      runtimeId: runtimeId,
      workflowId: '',
      nodeId: nodeId,
      cursor: ''
    });
  }, [nodeId]);

  const subscribe = () =>
    subscribeToMore({
      document: GetLogsSubscription,
      variables: { runtimeId, nodeId },
      updateQuery: (previousData, { subscriptionData }) => {
        if (!subscriptionData) return previousData;
        const newLog = get(subscriptionData.data, 'nodeLogs');
        return {
          ...previousData,
          logs: [...previousData.logs, newLog]
        };
      }
    });

  useEffect(() => {
    onUpdate();
  }, [logs, onUpdate]);

  // From now, logs are incremental, check the key in case this changes
  const logElements = logs.map((log: GetLogs_nodeLogs, idx: number) => (
    <LogItem {...log} key={`logItem_${idx}`} />
  ));
  return (
    <div
      ref={listRef}
      className={styles.listContainer}
      id="VersionLogsListContainer"
    >
      {loading && <SpinnerLinear />}
      {!loading && !!logs.length && nextPage && (
        <div
          className={cx(styles.container, styles.loadPreviousLogs)}
          onClick={loadPreviousLogs}
        >
          <span>... Load previous logs</span>
        </div>
      )}
      {logElements}
    </div>
  );
}

export default LogsList;
