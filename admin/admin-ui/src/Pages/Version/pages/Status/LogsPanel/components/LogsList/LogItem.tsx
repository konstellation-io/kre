import ContextMenu, {
  MenuCallToAction
} from 'Components/ContextMenu/ContextMenu';
import React, { memo, useState } from 'react';

import { GetServerLogs_logs_items } from 'Graphql/queries/types/GetServerLogs';
import IconCopyAll from '@material-ui/icons/FileCopy';
import IconCopyMessage from '@material-ui/icons/Subject';
import IconExpand from '@material-ui/icons/ArrowDownward';
import LevelIcon from 'Components/LevelIcon/LevelIcon';
import { copyToClipboard } from 'Utils/clipboard';
import cx from 'classnames';
import moment from 'moment';
import styles from './LogsList.module.scss';

interface Props extends GetServerLogs_logs_items {
  toggleOpen: (index: number) => void;
  index: number;
  opened: boolean;
}
function LogItem({
  date,
  workflowName,
  nodeName,
  message,
  level,
  toggleOpen,
  opened,
  index
}: Props) {
  const [localOpened, setLocalOpened] = useState<boolean>(opened);
  const dateFormatted = moment(date).format('YYYY-MM-DD');
  const hourFormatted = moment(date).format('HH:mm:ss.SSS');

  function getTrace() {
    return `${level}  [${date}] ${workflowName}:${nodeName} - ${message}`;
  }

  function toggleOpenStatus() {
    setLocalOpened(!localOpened);
    toggleOpen(index);
  }

  function copyMessage() {
    copyToClipboard(message);
  }
  function copyTrace() {
    copyToClipboard(getTrace());
  }

  const contextMenuActions: MenuCallToAction[] = [
    {
      Icon: IconCopyMessage,
      text: 'copy log message',
      callToAction: copyMessage
    },
    {
      Icon: IconCopyAll,
      text: 'copy complete log trace',
      callToAction: copyTrace
    }
  ];

  return (
    <ContextMenu actions={contextMenuActions}>
      <div>
        <div
          className={cx(styles.container, styles[level], {
            [styles.opened]: localOpened
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
            <div className={styles.message}>
              <pre>{message}</pre>
            </div>
            <div className={styles.expand} onClick={toggleOpenStatus}>
              <IconExpand className="icon-regular" />
            </div>
          </div>
          {localOpened && (
            <div className={styles.messageComplete}>{message}</div>
          )}
        </div>
      </div>
    </ContextMenu>
  );
}

export default memo(LogItem);
