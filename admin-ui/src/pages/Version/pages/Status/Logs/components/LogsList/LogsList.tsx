import { get } from 'lodash';

import React, { useEffect } from 'react';
import { loader } from 'graphql.macro';
import {
  useSubscription,
  useQuery,
  useApolloClient,
  SubscriptionHookOptions
} from '@apollo/react-hooks';
import { GET_LOGS } from '../../../../../../../graphql/client/queries/getLogs.graphql';

import LogItem from './LogItem';

import {
  GetLogs,
  GetLogs_nodeLogs,
  GetLogsVariables
} from '../../../../../../../graphql/subscriptions/types/GetLogs';

import styles from './LogsList.module.scss';
import { LocalState } from '../../../../../../../index';

const GetLogsSubscription = loader(
  '../../../../../../../graphql/subscriptions/getLogsSubscription.graphql'
);

type Props = {
  nodeId: string;
  runtimeId: string;
  onUpdate: () => void;
};
function LogsList({ nodeId, onUpdate, runtimeId }: Props) {
  const client = useApolloClient();
  const { data } = useQuery<LocalState>(GET_LOGS);
  const logs = data ? data.logs : [];

  useSubscription<GetLogs, GetLogsVariables>(GetLogsSubscription, {
    variables: {
      runtimeId,
      nodeId
    },
    onSubscriptionData: (
      msg: SubscriptionHookOptions<GetLogs, GetLogsVariables>
    ) => {
      const logInfo = get(msg, 'subscriptionData.data.nodeLogs');
      addLog(logInfo);
    }
  });

  // Clear logs before closing the logs panel
  useEffect(() => {
    return () => {
      client.writeData({ data: { logs: [] } });
    };
  }, [client]);

  useEffect(() => {
    onUpdate();
  }, [logs, onUpdate]);

  function addLog(item: GetLogs_nodeLogs) {
    client.writeData({
      data: {
        logs: logs.concat([item])
      }
    });
  }

  // From now, logs are incremental, check the key in case this changes
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
