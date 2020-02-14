import { get } from 'lodash';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { loader } from 'graphql.macro';
import {
  useSubscription,
  useQuery,
  useApolloClient
} from '@apollo/react-hooks';
import { CLEAR_LOGS } from '../../../../../../../graphql/client/clearLogs.graphql';

import LogItem from './LogItem';
import { Node } from '../../../RuntimeStatusPreview';

import {
  GetLogs,
  GetLogs_nodeLogs,
  GetLogsVariables
} from '../../../../../../../graphql/subscriptions/types/GetLogs';

import styles from './LogsList.module.scss';

const GetLogsSubscription = loader(
  '../../../../../../../graphql/subscriptions/getLogsSubscription.graphql'
);

type Props = {
  node: Node;
  onUpdate: () => void;
};
function LogsList({ node, onUpdate }: Props) {
  const client = useApolloClient();
  const { runtimeId } = useParams();
  const [logs, setLogs] = useState<GetLogs_nodeLogs[]>([]);
  const { data } = useQuery(CLEAR_LOGS);

  useSubscription<GetLogs, GetLogsVariables>(GetLogsSubscription, {
    variables: {
      runtimeId: runtimeId || '',
      nodeId: node.id
    },
    onSubscriptionData: (msg: any) => {
      const logInfo = get(msg, 'subscriptionData.data.nodeLogs');
      addLog(logInfo);
    }
  });

  useEffect(() => {
    if (data && data.clearLogs) {
      setLogs([]);
      client.writeData({ data: { clearLogs: false } });
    }
  }, [data]);

  useEffect(() => {
    onUpdate();
  }, [logs, onUpdate]);

  function addLog(item: GetLogs_nodeLogs) {
    setLogs((logsCp: GetLogs_nodeLogs[]) => logsCp.concat([item]));
  }

  // TODO: change this
  const logElements = logs.map((log: GetLogs_nodeLogs, idx: number) => (
    <LogItem {...log} key={`logItem_${idx}`} />
  ));

  return (
    <div className={styles.listContainer} id="VersionLogsListContainer">
      {logElements}
    </div>
  );
}

export default LogsList;
