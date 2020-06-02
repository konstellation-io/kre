import React, { WheelEvent, useRef } from 'react';
import styles from './TabContainer.module.scss';
import cx from 'classnames';
import IconMoreVert from '@material-ui/icons/MoreVert';
import { GetLogTabs_logTabs } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import ContextMenu, {
  MenuCallToAction
} from '../../../../../../../components/ContextMenu/ContextMenu';

type Props = {
  tabs: GetLogTabs_logTabs[];
  activeTabId: string;
  onTabClick: Function;
  contextMenuActions: MenuCallToAction[];
};
function TabContainer({
  tabs,
  activeTabId,
  onTabClick,
  contextMenuActions
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  function onMouseWheel(e: WheelEvent<HTMLElement>) {
    if (containerRef.current) containerRef.current.scrollLeft += e.deltaY;
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
          >
            <span
              className={styles.title}
            >{`${tab.runtimeName} / ${tab.versionName}`}</span>
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
