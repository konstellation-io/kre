import {
  GET_LOG_TABS,
  GetLogTabs,
  GetLogTabs_logTabs
} from 'Graphql/client/queries/getLogs.graphql';
import React, { useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/react-hooks';

import Header from './components/Header/Header';
import IconClose from '@material-ui/icons/Close';
import IconCloseOthers from '@material-ui/icons/ClearAll';
import IconDuplicate from '@material-ui/icons/ControlPointDuplicate';
import IconOpenInTab from '@material-ui/icons/Tab';
import { Location } from 'history';
import LogsTab from './components/LogsTab/LogsTab';
import { MenuCallToAction } from 'Components/ContextMenu/ContextMenu';
import ROUTE from 'Constants/routes';
import TabContainer from './components/TabContainer/TabContainer';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './LogsPanel.module.scss';
import { useLocation } from 'react-router-dom';

function actualPageIsLogs(location: Location) {
  return location.pathname.startsWith(ROUTE.LOGS.replace(':logTabInfo', ''));
}

function LogsPanel() {
  const client = useApolloClient();
  const location = useLocation();
  const onlyShowLogs = actualPageIsLogs(location);
  const [fullScreen, setFullScreen] = useState(onlyShowLogs);

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
  function toggleFullScreen() {
    setFullScreen(!fullScreen);
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

  function closeAllButIndex(index: number): void {
    const newTabs = [tabs[index]];
    const newActiveTabId = tabs[index].uniqueId;

    client.writeData({
      data: { activeTabId: newActiveTabId, logTabs: newTabs }
    });
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

  function openInANewTab(index: number) {
    const logTabInfo = encodeURIComponent(JSON.stringify(tabs[index]));

    window
      .open(ROUTE.LOGS.replace(':logTabInfo', logTabInfo), '_blank')
      ?.focus();
  }

  const contextMenuActions: MenuCallToAction[] = [
    {
      Icon: IconDuplicate,
      text: 'duplicate',
      callToAction: duplicateTab
    },
    {
      Icon: IconOpenInTab,
      text: 'open in a new tab',
      callToAction: (_: any, index: number) => openInANewTab(index)
    },
    {
      Icon: IconCloseOthers,
      text: 'close others',
      disabled: tabs.length < 2,
      callToAction: (_: any, index: number) => closeAllButIndex(index)
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
          [styles.hidden]: hidden,
          [styles.fullScreen]: fullScreen
        })}
      >
        {!onlyShowLogs && (
          <Header
            togglePanel={togglePanel}
            toggleFullScreen={toggleFullScreen}
            opened={opened}
            fullScreen={fullScreen}
          />
        )}
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
              runtimeId={tab.runtimeId}
              versionId={tab.versionId}
              uniqueId={tab.uniqueId}
              filterValues={tab.filters}
            />
          </div>
        ))}
      </div>
      <div
        className={cx(styles.shield, {
          [styles.show]: opened && !hidden && !fullScreen
        })}
        onClick={togglePanel}
      />
    </>
  );
}

export default LogsPanel;
