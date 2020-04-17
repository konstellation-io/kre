import React from 'react';
import styles from './TabContainer.module.scss';
import cx from 'classnames';
import IconClose from '@material-ui/icons/Close';
import { GetLogTabs_logTabs } from '../../../../../../../graphql/client/queries/getLogs.graphql';

type Props = {
  tabs: GetLogTabs_logTabs[];
  activeTabId: string;
  onTabClick: Function;
  onCloseTabClick: Function;
};
function TabContainer({
  tabs,
  activeTabId,
  onTabClick,
  onCloseTabClick
}: Props) {
  return (
    <div className={styles.tabContainer}>
      {tabs.map((tab: GetLogTabs_logTabs, index: number) => (
        <div
          className={cx({ [styles.selected]: activeTabId === tab.uniqueId })}
          onClick={() => onTabClick(tab.uniqueId)}
          key={tab.uniqueId}
        >
          <span>{tab.nodeName}</span>
          <IconClose
            className={'icon-small'}
            onClick={event => onCloseTabClick(event, index)}
          />
        </div>
      ))}
    </div>
  );
}

export default TabContainer;
