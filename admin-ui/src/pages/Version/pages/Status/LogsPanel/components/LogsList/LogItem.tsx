import React, { memo, useState, useRef, RefObject } from 'react';
import moment from 'moment';
import LevelIcon from '../../../../../../../components/LevelIcon/LevelIcon';
import IconExpand from '@material-ui/icons/ArrowDownward';
import IconCopyAll from '@material-ui/icons/FileCopy';
import IconCopyMessage from '@material-ui/icons/Subject';
import styles from './LogsList.module.scss';
import cx from 'classnames';
import { GetServerLogs_logs_items } from '../../../../../../../graphql/queries/types/GetServerLogs';
import ContextMenu, {
  MenuCallToAction
} from '../../../../../../../components/ContextMenu/ContextMenu';

function onCopyToClipboard(input: RefObject<HTMLInputElement>) {
  if (input.current !== null) {
    input.current.select();
    input.current.setSelectionRange(0, 99999);

    document.execCommand('copy');
  }
}

interface Props extends GetServerLogs_logs_items {
  alwaysOpened: boolean;
}
function LogItem({
  date,
  workflowName,
  nodeName,
  message,
  level,
  alwaysOpened
}: Props) {
  const [opened, setOpened] = useState<boolean>(false);
  const dateFormatted = moment(date).format('YYYY-MM-DD');
  const hourFormatted = moment(date).format('HH:mm:ss.SSS');
  const messageRef = useRef<HTMLInputElement>(null);
  const traceRef = useRef<HTMLInputElement>(null);

  function getTrace() {
    return `${level}  [${date}] ${workflowName}:${nodeName} - ${message}`;
  }

  function toggleOpenStatus() {
    setOpened(!opened);
  }

  function copyMessage() {
    onCopyToClipboard(messageRef);
  }
  function copyTrace() {
    onCopyToClipboard(traceRef);
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
        <input
          type="text"
          value={message}
          ref={messageRef}
          readOnly
          className={styles.clipboardInput}
        />
        <input
          type="text"
          value={getTrace()}
          ref={traceRef}
          readOnly
          className={styles.clipboardInput}
        />
        <div
          className={cx(styles.container, styles[level], {
            [styles.opened]: opened || alwaysOpened
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
            {!alwaysOpened && (
              <div className={styles.expand} onClick={toggleOpenStatus}>
                <IconExpand className="icon-regular" />
              </div>
            )}
          </div>
          {(alwaysOpened || opened) && (
            <div className={styles.messageComplete}>{message}</div>
          )}
        </div>
      </div>
    </ContextMenu>
  );
}

export default memo(LogItem);
