import { get } from 'lodash';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { loader } from 'graphql.macro';
import {
  useSubscription,
  useQuery,
  useApolloClient
} from '@apollo/react-hooks';
import { GET_LOGS } from '../../../../../../../graphql/client/getLogs.graphql';

import LogItem from './LogItem';
import { Node } from '../../../RuntimeStatusPreview';

import {
  GetLogs,
  GetLogs_nodeLogs,
  GetLogsVariables
} from '../../../../../../../graphql/subscriptions/types/GetLogs';

import styles from './LogsList.module.scss';
import { LocalState } from '../../../../../../..';

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
  const { data } = useQuery<LocalState>(GET_LOGS);

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

  // Clear logs before closing the logs panel
  useEffect(() => {
    return () => {
      client.writeData({ data: { logs: [] } });
    };
  }, []);

  useEffect(() => {
    onUpdate();
  }, [data && data.logs, onUpdate]);

  function addLog(item: GetLogs_nodeLogs) {
    client.writeData({
      data: {
        logs: data && data.logs.concat([item])
      }
    });
  }

  // FIXME: change key values (maybe by getting an ID from the API?)
  const logElements =
    data &&
    data.logs.map((log: GetLogs_nodeLogs, idx: number) => (
      <LogItem {...log} key={`logItem_${idx}`} />
    ));

  return (
    <div className={styles.listContainer} id="VersionLogsListContainer">
      {logElements}
    </div>
  );
}

export default LogsList;
