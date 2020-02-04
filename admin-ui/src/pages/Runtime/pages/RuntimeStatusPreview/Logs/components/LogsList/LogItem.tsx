import React, { useState } from 'react';
import moment from 'moment';

import IconInfo from '@material-ui/icons/Info';
import IconExpand from '@material-ui/icons/ArrowDownward';

import { NodeLog, LogLevel } from '../../../../../../../graphql/models';

import styles from './LogsList.module.scss';
import cx from 'classnames';

const LEVEL_TO_ICON: { [key: string]: any } = {
  [LogLevel.INFO]: IconInfo
};

function LogItem({ date, nodeId, podId, message, level }: NodeLog) {
  const [opened, setOpened] = useState<boolean>(false);

  const dateFormatted = moment(date).format('YYYY-MM-DD');
  const hourFormatted = moment(date).format('hh:mm:ss');

  const LevelIcon = LEVEL_TO_ICON[level];

  function toggleOpenStatus() {
    setOpened(!opened);
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: opened
      })}
    >
      <div className={styles.row1}>
        <div className={styles.icon}>
          <LevelIcon className="icon-small" />
        </div>
        <div className={styles.date}>{dateFormatted}</div>
        <div className={styles.hour}>{hourFormatted}</div>
        {/* <div className={styles.nodeId}>{nodeId}</div> */}
        {/* <div className={styles.podId}>{`[${podId}]`}</div> */}
        <div className={styles.message}>{message}</div>
        <div className={styles.expand} onClick={toggleOpenStatus}>
          <IconExpand className="icon-regular" />
        </div>
      </div>
      {opened && <div className={styles.messageComplete}>{message}</div>}
    </div>
  );
}

export default LogItem;
