import { get } from 'lodash';

import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useSubscription } from '@apollo/react-hooks';

import LogItem from './LogItem';

import { GET_LOGS_SUBSCRIPTION } from '../../Logs.graphql';
import { NodeLog } from '../../../../../../../graphql/models';

import styles from './LogsList.module.scss';

type Props = {
  nodeId?: string;
};
function LogsList({ nodeId }: Props) {
  const { runtimeId } = useParams();
  const [logs, setLogs] = useState<NodeLog[]>([]);

  useSubscription<NodeLog>(GET_LOGS_SUBSCRIPTION, {
    variables: {
      runtimeId,
      nodeId
    },
    onSubscriptionData: (msg: any) => {
      const logInfo = get(msg, 'subscriptionData.data.nodeLogs');
      addLog(logInfo);
    }
  });

  function addLog(item: NodeLog) {
    setLogs((logsCp: NodeLog[]) => logsCp.concat([item]));
  }

  // TODO: change this
  const logElements = logs.map((log: NodeLog, idx: number) => (
    <LogItem {...log} key={`logItem_${idx}`} />
  ));

  return (
    <div className={styles.listContainer} id="VersionLogsListContainer">
      {logElements}
    </div>
  );
}

export default LogsList;
