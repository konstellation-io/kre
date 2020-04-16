import React from 'react';

import Header from './components/Header/Header';
import LogsTab from './components/LogsTab/LogsTab';

import cx from 'classnames';
import styles from './Logs.module.scss';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import { GET_LOGS } from '../../../../../graphql/client/queries/getLogs.graphql';
import { get } from 'lodash';

function Logs() {
  const client = useApolloClient();
  const { data: localData } = useQuery(GET_LOGS);

  const opened = get(localData, 'logsOpened', false);

  function setOpened(value: boolean) {
    client.writeData({ data: { logsOpened: value } });
  }

  function togglePanel() {
    setOpened(!opened);
  }

  function clearLogs(): void {
    client.writeData({ data: { logs: [] } });
  }

  const logPanel = localData && localData.logPanel;
  const hidden = !logPanel;

  return (
    <>
      <div
        className={cx(styles.container, {
          [styles.opened]: opened,
          [styles.hidden]: hidden
        })}
      >
        <Header
          togglePanel={togglePanel}
          opened={opened}
          onClearClick={clearLogs}
        />
        <div className={cx(styles.content, { [styles.opened]: opened })}>
          {logPanel && (
            <LogsTab
              nodeId={logPanel.nodeId}
              runtimeId={logPanel.runtimeId}
              nodeName={logPanel.nodeName}
            />
          )}
        </div>
      </div>
      <div
        className={cx(styles.shield, { [styles.show]: opened })}
        onClick={togglePanel}
      />
    </>
  );
}

export default Logs;
