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
import styles from './LogsPanel.module.scss';
import { useLocation } from 'react-router-dom';
import useLogs from 'Graphql/hooks/useLogs';
import { useReactiveVar } from '@apollo/client';
import { activeTabId, logsOpened, logTabs } from 'Graphql/client/cache';

function actualPageIsLogs(location: Location<unknown>) {
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

  const dataLogsOpened = useReactiveVar(logsOpened);
  const dataActiveTabId = useReactiveVar(activeTabId);
  const dataLogTabs = useReactiveVar(logTabs);

  function toggleFullScreen() {
    setFullScreen(!fullScreen);
  }

  function handleTabClick(uniqueId: string): void {
    openTab(uniqueId);
  }

  function openInANewTab(index: number) {
    const logTabInfo = encodeURIComponent(JSON.stringify(dataLogTabs[index]));

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
      disabled: dataLogTabs.length < 2,
      callToAction: (_: any, index: number) => closeOtherTabs(index)
    },
    {
      Icon: IconClose,
      text: 'close',
      callToAction: (_: any, index: number) => closeTab(index)
    }
  ];

  const hidden = dataLogTabs.length === 0;
  return (
    <>
      <div
        className={cx(styles.container, {
          [styles.opened]: dataLogsOpened,
          [styles.hidden]: hidden,
          [styles.fullScreen]: fullScreen
        })}
      >
        {!onlyShowLogs && (
          <Header
            togglePanel={toggleLogs}
            toggleFullScreen={toggleFullScreen}
            opened={dataLogsOpened}
            fullScreen={fullScreen}
          />
        )}
        <TabContainer
          tabs={dataLogTabs}
          activeTabId={dataActiveTabId}
          contextMenuActions={contextMenuActions}
          onTabClick={handleTabClick}
          closeTab={closeTab}
        />
        {dataLogTabs.map(tab => (
          <div
            className={cx(styles.content, {
              [styles.opened]: dataLogsOpened,
              [styles.inactiveTab]: dataActiveTabId !== tab.uniqueId
            })}
            key={tab.uniqueId}
          >
            <LogsTab
              runtimeId={tab.runtimeId}
              versionName={tab.versionName}
              uniqueId={tab.uniqueId}
              filterValues={tab.filters}
            />
          </div>
        ))}
      </div>
      <div
        className={cx(styles.shield, {
          [styles.show]: dataLogsOpened && !hidden && !fullScreen
        })}
        onClick={toggleLogs}
      />
    </>
  );
}

export default LogsPanel;
