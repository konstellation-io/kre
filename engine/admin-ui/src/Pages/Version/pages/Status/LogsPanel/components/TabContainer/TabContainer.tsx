import { ContextMenu, MenuCallToAction } from 'kwc';
import React, { MouseEvent, useRef, WheelEvent } from 'react';

import IconMoreVert from '@material-ui/icons/MoreVert';
import cx from 'classnames';
import styles from './TabContainer.module.scss';
import { useReactiveVar } from '@apollo/client';
import { LogPanel } from 'Graphql/client/typeDefs';
import { openedVersion } from 'Graphql/client/cache';

const MOUSE_MIDDLE_BUTTON = 1;

type Props = {
  tabs: LogPanel[];
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
  const dataOpenedVersion = useReactiveVar(openedVersion);

  function onMouseWheel(e: WheelEvent<HTMLDivElement>) {
    if (containerRef.current) containerRef.current.scrollLeft += e.deltaY;
  }

  function onMouseDown(e: MouseEvent<HTMLDivElement>, index: number) {
    if (e.button === MOUSE_MIDDLE_BUTTON) closeTab(index);
  }

  function sameVersionAsOpened(runtimeName: string, versionName: string) {
    if (!dataOpenedVersion) return false;

    return (
      dataOpenedVersion.runtimeName === runtimeName &&
      dataOpenedVersion.versionName === versionName
    );
  }

  return (
    <div
      className={styles.tabContainer}
      onWheel={onMouseWheel}
      ref={containerRef}
    >
      {tabs.map((tab, index: number) => (
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
