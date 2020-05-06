import React from 'react';
import Header from './components/Header/Header';
import LogsTab from './components/LogsTab/LogsTab';
import cx from 'classnames';
import styles from './Logs.module.scss';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import IconClose from '@material-ui/icons/Close';
import IconDuplicate from '@material-ui/icons/ControlPointDuplicate';
import {
  GET_LOG_TABS,
  GetLogTabs_logTabs,
  GetLogTabs
} from '../../../../../graphql/client/queries/getLogs.graphql';
import { get } from 'lodash';
import TabContainer from './components/TabContainer/TabContainer';
import { MenuCallToAction } from '../../../../../components/ContextMenu/ContextMenu';

function Logs() {
  const client = useApolloClient();
  const { data: localData } = useQuery<GetLogTabs>(GET_LOG_TABS);

  const opened = get(localData, 'logsOpened', false);
  const activeTabId = get(localData, 'activeTabId', '');
  const tabs = get<GetLogTabs, 'logTabs', GetLogTabs_logTabs[]>(
    localData,
    'logTabs',
    []
  );

  function setOpened(value: boolean) {
    client.writeData({ data: { logsOpened: value } });
  }

  function togglePanel() {
    setOpened(!opened);
  }

  function handleTabClick(uniqueId: string): void {
    client.writeData({ data: { activeTabId: uniqueId } });
  }

  function getNewActiveTabId(index: number, newTabs: GetLogTabs_logTabs[]) {
    let newActiveTabId = activeTabId;
    const isRemovingSelectedTab = tabs[index].uniqueId === activeTabId;

    if (isRemovingSelectedTab) {
      newActiveTabId = newTabs[Math.max(0, index - 1)]?.uniqueId || '';
    }

    return newActiveTabId;
  }

  function closeTabByIndex(index: number): void {
    const newTabs = [...tabs];
    newTabs.splice(index, 1);
    const newActiveTabId = getNewActiveTabId(index, newTabs);

    client.writeData({
      data: { activeTabId: newActiveTabId, logTabs: newTabs }
    });
  }

  function duplicateTab(_: any, index: number): void {
    const tabToDuplicate = tabs[index];
    const activeTabId = `${Date.now()}`;
    client.writeData({
      data: {
        activeTabId,
        logTabs: [
          ...tabs,
          {
            ...tabToDuplicate,
            uniqueId: activeTabId
          }
        ]
      }
    });
  }

  const contextMenuActions: MenuCallToAction[] = [
    {
      Icon: IconDuplicate,
      text: 'duplicate',
      callToAction: duplicateTab
    },
    {
      Icon: IconClose,
      text: 'close',
      callToAction: (_: any, index: number) => closeTabByIndex(index)
    }
  ];

  const hidden = tabs.length === 0;
  return (
    <>
      <div
        className={cx(styles.container, {
          [styles.opened]: opened,
          [styles.hidden]: hidden
        })}
      >
        <Header togglePanel={togglePanel} opened={opened} />
        <TabContainer
          tabs={tabs}
          activeTabId={activeTabId}
          contextMenuActions={contextMenuActions}
          onTabClick={handleTabClick}
        />
        {tabs.map((tab: GetLogTabs_logTabs) => (
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
              uniqueId={tab.uniqueId}
              filterValues={tab.filters}
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
