import React from 'react';
import styles from './TabContainer.module.scss';
import cx from 'classnames';
import IconClose from '@material-ui/icons/Close';
import { GetLogTabs_logTabs } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import ContextMenu, {
  MenuCallToAction
} from '../../../../../../../components/ContextMenu/ContextMenu';

type Props = {
  tabs: GetLogTabs_logTabs[];
  activeTabId: string;
  onTabClick: Function;
  onCloseTabClick: Function;
  contextMenuActions: MenuCallToAction[];
};
function TabContainer({
  tabs,
  activeTabId,
  onTabClick,
  onCloseTabClick,
  contextMenuActions
}: Props) {
  return (
    <div className={styles.tabContainer}>
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
            <span>{tab.nodeName}</span>
            <IconClose
              className={'icon-small'}
              onClick={event => onCloseTabClick(event, index)}
            />
          </div>
        </ContextMenu>
      ))}
    </div>
  );
}

export default TabContainer;
