import React, { memo, useState } from 'react';
import moment from 'moment';

import IconInfo from '@material-ui/icons/Info';
import IconExpand from '@material-ui/icons/ArrowDownward';

import styles from './LogsList.module.scss';
import cx from 'classnames';
import { GetServerLogs_logs_items } from '../../../../../../../graphql/queries/types/GetServerLogs';
import { LogLevel } from '../../../../../../../graphql/types/globalTypes';

type Props = {
  level: LogLevel;
};
function LevelIcon({ level }: Props) {
  let icon = null;

  switch (level) {
    case LogLevel.INFO:
      icon = <IconInfo className="icon-small" />;
      break;
    case LogLevel.DEBUG:
      icon = '!';
      break;
    case LogLevel.WARN:
      icon = '!!';
      break;
    case LogLevel.ERROR:
      icon = '!!!';
      break;
  }

  return <div className={styles[level]}>{icon}</div>;
}

function LogItem({ date, nodeName, message, level }: GetServerLogs_logs_items) {
  const [opened, setOpened] = useState<boolean>(false);
  const dateFormatted = moment(date).format('YYYY-MM-DD');
  const hourFormatted = moment(date).format('HH:mm:ss');

  // TODO: get this from API
  const workflow = 'Workflow X';

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
        <div className={styles.workflow} title={workflow}>
          {workflow}
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
