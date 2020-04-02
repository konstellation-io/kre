import { get } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { loader } from 'graphql.macro';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { GET_LOGS } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import LogItem from './LogItem';
import { GetLogs_nodeLogs } from '../../../../../../../graphql/subscriptions/types/GetLogs';
import styles from './LogsList.module.scss';
import {
  GetServerLogs,
  GetServerLogsVariables
} from '../../../../../../../graphql/queries/types/GetServerLogs';
import moment from 'moment';
import LoadMore from './LoadMore';
import SpinnerLinear from '../../../../../../../components/LoadingComponents/SpinnerLinear/SpinnerLinear';
const GetLogsSubscription = loader(
  '../../../../../../../graphql/subscriptions/getLogsSubscription.graphql'
);
const GetServerLogsQuery = loader(
  '../../../../../../../graphql/queries/getServerLogs.graphql'
);

const yesterday = moment()
  .subtract(1, 'day')
  .startOf('day');
const now = moment()
  .endOf('day')
  .toISOString();

type GetFiltersParams = {
  runtimeId: string;
  nodeId: string;
};
function getFilters({ runtimeId, nodeId }: GetFiltersParams) {
  return {
    startDate: yesterday.toISOString(),
    endDate: now,
    workflowId: '',
    cursor: '',
    runtimeId,
    nodeId
  };
}

type Props = {
  nodeId: string;
  runtimeId: string;
  onUpdate: () => void;
};

function LogsList({ nodeId, onUpdate, runtimeId }: Props) {
  const [nextPage, setNextPage] = useState('');
  const client = useApolloClient();
  const listRef = useRef(null);
  const unsubscribe = useRef<Function | null>(null);

  const { data } = useQuery(GET_LOGS);
  const logs = get(data, 'logs', []);
  const filter = getFilters({ runtimeId, nodeId });

  function resubscribe() {
    unsubscribe.current && unsubscribe.current();
    unsubscribe.current = subscribe();
  }

  const { loading, refetch, fetchMore, subscribeToMore } = useQuery<
    GetServerLogs,
    GetServerLogsVariables
  >(GetServerLogsQuery, {
    variables: filter,
    onCompleted: data => {
      client.writeData({ data: { logs: [...data.logs.logs.reverse()] } });
      setNextPage(data.logs.cursor || '');
      resubscribe();
    },
    onError: () => resubscribe(),
    fetchPolicy: 'no-cache'
  });

  useEffect(() => {
    refetch(getFilters({ runtimeId, nodeId }));
    // Ignore refetch dependency, we do not want to refetch when refetch func changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, runtimeId]);

  useEffect(() => {
    onUpdate();
  }, [logs, onUpdate]);

  if (loading) return <SpinnerLinear />;

  // Pagination query
  function loadPreviousLogs() {
    fetchMore({
      variables: {
        ...filter,
        cursor: nextPage
      },
      // @ts-ignore
      updateQuery: (prev, { fetchMoreResult }) => {
        const newData = fetchMoreResult && fetchMoreResult.logs;

        if (newData) {
          client.writeData({
            data: { logs: [...newData.logs.reverse(), ...logs] }
          });
          setNextPage(newData.cursor || '');
        }
      }
    });
  }

  // Subscription query
  const subscribe = () =>
    subscribeToMore({
      document: GetLogsSubscription,
      variables: { runtimeId, nodeId },
      // @ts-ignore
      updateQuery: (prev, { subscriptionData }) => {
        const newLog = get(subscriptionData.data, 'nodeLogs');
        const logs = client.readQuery({ query: GET_LOGS });

        client.writeData({ data: { logs: [...logs.logs, newLog] } });
      }
    });

  const logElements = logs.map((log: GetLogs_nodeLogs, idx: number) => (
    <LogItem {...log} key={`${idx}-${log.date}`} />
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
