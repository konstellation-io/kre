import {
  GET_LOG_TABS,
  GetLogTabs,
  GetLogTabs_logTabs
} from 'Graphql/client/queries/getLogs.graphql';
import React, { useState } from 'react';

import Header from './components/Header/Header';
import IconClose from '@material-ui/icons/Close';
import IconCloseOthers from '@material-ui/icons/ClearAll';
import IconDuplicate from '@material-ui/icons/ControlPointDuplicate';
import IconOpenInTab from '@material-ui/icons/Tab';
import { Location } from 'history';
import LogsTab from './components/LogsTab/LogsTab';
import { MenuCallToAction } from 'kwc';
import ROUTE from 'Constants/routes';
import TabContainer from './components/TabContainer/TabContainer';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './LogsPanel.module.scss';
import { useLocation } from 'react-router-dom';
import useLogs from 'Graphql/hooks/useLogs';
import { useQuery } from '@apollo/client';

function actualPageIsLogs(location: Location) {
  return location.pathname.startsWith(ROUTE.LOGS.replace(':logTabInfo', ''));
}

function LogsPanel() {
  const {
    openTab,
    closeTab,
    closeOtherTabs,
    duplicateTab,
    toggleLogs
  } = useLogs();
  const location = useLocation();
  const onlyShowLogs = actualPageIsLogs(location);
  const [fullScreen, setFullScreen] = useState(onlyShowLogs);

  const { data: localData } = useQuery<GetLogTabs>(GET_LOG_TABS);
  const opened = get(localData, 'logsOpened', false);
  const actActiveTabId = get(localData, 'activeTabId', '');
  const tabs = get<GetLogTabs, 'logTabs', GetLogTabs_logTabs[]>(
    localData,
    'logTabs',
    []
  );

  function toggleFullScreen() {
    setFullScreen(!fullScreen);
  }

  function handleTabClick(uniqueId: string): void {
    openTab(uniqueId);
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
      callToAction: (_: any, index: number) => duplicateTab(index)
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
      callToAction: (_: any, index: number) => closeOtherTabs(index)
    },
    {
      Icon: IconClose,
      text: 'close',
      callToAction: (_: any, index: number) => closeTab(index)
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
            togglePanel={toggleLogs}
            toggleFullScreen={toggleFullScreen}
            opened={opened}
            fullScreen={fullScreen}
          />
        )}
        <TabContainer
          tabs={tabs}
          activeTabId={actActiveTabId}
          contextMenuActions={contextMenuActions}
          onTabClick={handleTabClick}
          closeTab={closeTab}
        />
        {tabs.map((tab: GetLogTabs_logTabs) => (
          <div
            className={cx(styles.content, {
              [styles.opened]: opened,
              [styles.inactiveTab]: actActiveTabId !== tab.uniqueId
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
        onClick={toggleLogs}
      />
    </>
  );
}

export default LogsPanel;
