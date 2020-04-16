import React from 'react';

import Header from './components/Header/Header';
import LogsTab from './components/LogsTab/LogsTab';

import cx from 'classnames';
import styles from './Logs.module.scss';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import { GET_LOG_TABS } from '../../../../../graphql/client/queries/getLogs.graphql';
import { get } from 'lodash';
import { LogPanel } from '../../../../../graphql/client/typeDefs';
import TabContainer from './components/TabContainer/TabContainer';

function Logs() {
  const client = useApolloClient();
  const { data: localData } = useQuery(GET_LOG_TABS);

  const opened = get(localData, 'logsOpened', false);
  const activeTabId = get(localData, 'activeTabId', '');
  const tabs = get(localData, 'logTabs', []);

  function setOpened(value: boolean) {
    client.writeData({ data: { logsOpened: value } });
  }

  function togglePanel() {
    setOpened(!opened);
  }

  function clearLogs(): void {
    // Refactor the clear logs feature
    client.writeData({ data: { logs: [] } });
  }

  function handleTabClick(uniqueId: string): void {
    client.writeData({ data: { activeTabId: uniqueId } });
  }

  function handleCloseTabClick(
    event: React.MouseEvent<HTMLSpanElement>,
    index: number
  ): void {
    event.stopPropagation();
    let newActiveTabId = activeTabId;
    const newTabs = [...tabs];
    newTabs.splice(index, 1);
    const isRemovingSelectedTab = tabs[index].uniqueId === activeTabId;
    const isFirst = index === 0;
    if (isRemovingSelectedTab && !isFirst) {
      newActiveTabId = tabs[index - 1].uniqueId;
    } else if (isRemovingSelectedTab && isFirst && tabs.length > 1) {
      newActiveTabId = tabs[1].uniqueId;
    }
    client.writeData({
      data: { activeTabId: newActiveTabId, logTabs: newTabs }
    });
  }
  const hidden = tabs.length === 0;
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
        <TabContainer
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onCloseTabClick={handleCloseTabClick}
        />
        {tabs.map((tab: LogPanel) => (
          <div
            className={cx(styles.content, {
              [styles.opened]: opened,
              [styles.inactiveTab]: activeTabId !== tab.uniqueId
            })}
            key={tab.uniqueId}
          >
            <LogsTab
              nodeId={tab.nodeId}
              runtimeId={tab.runtimeId}
              nodeName={tab.nodeName}
              workflowId={tab.workflowId}
            />
          </div>
        ))}
      </div>
      <div
        className={cx(styles.shield, { [styles.show]: opened && !hidden })}
        onClick={togglePanel}
      />
    </>
  );
}

export default Logs;
