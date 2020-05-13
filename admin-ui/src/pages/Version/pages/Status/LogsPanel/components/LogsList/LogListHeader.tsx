import React from 'react';
import cx from 'classnames';
import styles from './LogsList.module.scss';

function LogListHeader() {
  return (
    <div className={cx(styles.container, styles.header)}>
      <div className={styles.row1}>
        <div className={styles.icon}></div>
        <div className={styles.date}>Date</div>
        <div className={styles.hour}>Time</div>
        <div className={styles.message}>Message</div>
        <div className={styles.expand}></div>
      </div>
    </div>
  );
}

export default LogListHeader;
