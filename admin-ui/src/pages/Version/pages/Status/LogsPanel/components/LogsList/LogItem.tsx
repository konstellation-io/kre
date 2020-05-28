import React, { memo, useState } from 'react';
import moment from 'moment';

import LevelIcon from '../../../../../../../components/LevelIcon/LevelIcon';
import IconExpand from '@material-ui/icons/ArrowDownward';

import styles from './LogsList.module.scss';
import cx from 'classnames';
import { GetServerLogs_logs_items } from '../../../../../../../graphql/queries/types/GetServerLogs';

function LogItem({
  date,
  workflowName,
  nodeName,
  message,
  level
}: GetServerLogs_logs_items) {
  const [opened, setOpened] = useState<boolean>(false);
  const dateFormatted = moment(date).format('YYYY-MM-DD');
  const hourFormatted = moment(date).format('HH:mm:ss');

  function toggleOpenStatus() {
    setOpened(!opened);
  }

  return (
    <div
      className={cx(styles.container, styles[level], {
        [styles.opened]: opened
      })}
    >
      <div className={cx(styles.row1, styles[level])}>
        <div className={styles.icon}>
          <LevelIcon level={level} />
        </div>
        <div className={styles.date}>{dateFormatted}</div>
        <div className={styles.hour}>{hourFormatted}</div>
        <div className={styles.workflow} title={workflowName || ''}>
          {workflowName || ''}
        </div>
        <div className={styles.node} title={nodeName || ''}>
          {nodeName}
        </div>
        <div className={styles.message}>{message}</div>
        <div className={styles.expand} onClick={toggleOpenStatus}>
          <IconExpand className="icon-regular" />
        </div>
      </div>
      {opened && <div className={styles.messageComplete}>{message}</div>}
    </div>
  );
}

export default memo(LogItem);
