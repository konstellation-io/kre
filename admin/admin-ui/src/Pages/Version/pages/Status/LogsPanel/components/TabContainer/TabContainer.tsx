import { ContextMenu, MenuCallToAction } from 'kwc';
import {
  GET_OPENED_VERSION_INFO,
  GetOpenedVersionInfo
} from 'Graphql/client/queries/getOpenedVersionInfo.graphql';
import React, { MouseEvent, WheelEvent, useRef } from 'react';

import { GetLogTabs_logTabs } from 'Graphql/client/queries/getLogs.graphql';
import IconMoreVert from '@material-ui/icons/MoreVert';
import cx from 'classnames';
import styles from './TabContainer.module.scss';
import { useQuery } from '@apollo/client';

const MOUSE_MIDDLE_BUTTON = 1;

type Props = {
  tabs: GetLogTabs_logTabs[];
  activeTabId: string;
  onTabClick: Function;
  contextMenuActions: MenuCallToAction[];
  closeTab: (index: number) => void;
};
function TabContainer({
  tabs,
  activeTabId,
  onTabClick,
  contextMenuActions,
  closeTab
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: localData } = useQuery<GetOpenedVersionInfo>(
    GET_OPENED_VERSION_INFO
  );
  const openedVersion = localData?.openedVersion;

  function onMouseWheel(e: WheelEvent<HTMLDivElement>) {
    if (containerRef.current) containerRef.current.scrollLeft += e.deltaY;
  }

  function onMouseDown(e: MouseEvent<HTMLDivElement>, index: number) {
    if (e.button === MOUSE_MIDDLE_BUTTON) closeTab(index);
  }

  function sameVersionAsOpened(runtimeName: string, versionName: string) {
    if (!openedVersion) return false;

    return (
      openedVersion.runtimeName === runtimeName &&
      openedVersion.versionName === versionName
    );
  }

  return (
    <div
      className={styles.tabContainer}
      onWheel={onMouseWheel}
      ref={containerRef}
    >
      {tabs.map((tab: GetLogTabs_logTabs, index: number) => (
        <ContextMenu
          key={tab.uniqueId}
          actions={contextMenuActions}
          contextObject={index}
        >
          <div
            className={cx(styles.tab, {
              [styles.selected]: activeTabId === tab.uniqueId
            })}
            onClick={() => onTabClick(tab.uniqueId)}
            onMouseDown={e => onMouseDown(e, index)}
            title={`${tab.runtimeName} - ${tab.versionName}`}
          >
            <span className={styles.runtime}>{tab.runtimeName}</span>
            <span className={styles.separator}>-</span>
            <span
              className={cx(styles.version, {
                [styles.openedVersion]: sameVersionAsOpened(
                  tab.runtimeName,
                  tab.versionName
                )
              })}
            >
              {tab.versionName}
            </span>
            <ContextMenu
              actions={contextMenuActions}
              contextObject={index}
              openOnLeftClick
            >
              <IconMoreVert className={cx('icon-small', styles.icon)} />
            </ContextMenu>
          </div>
        </ContextMenu>
      ))}
    </div>
  );
}

export default TabContainer;
