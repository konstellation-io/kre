import React from 'react';
import styles from './TabContainer.module.scss';
import { LogPanel } from '../../../../../../../graphql/client/typeDefs';
import cx from 'classnames';
import IconClose from '@material-ui/icons/Close';

type Props = {
  tabs: LogPanel[];
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
      {tabs.map((tab: LogPanel, index: number) => (
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
