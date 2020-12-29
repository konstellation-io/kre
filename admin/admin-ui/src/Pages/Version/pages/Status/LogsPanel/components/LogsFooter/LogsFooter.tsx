import { Button, Left, Right } from 'kwc';

import ClearIcon from '@material-ui/icons/Block';
import DownloadIcon from '@material-ui/icons/GetApp';
import FollowIcon from '@material-ui/icons/VerticalAlignBottom';
import { GetServerLogs_logs_items } from 'Graphql/queries/types/GetServerLogs';
import React from 'react';
import cx from 'classnames';
import { downloadFile } from 'Utils/download';
import styles from './LogsFooter.module.scss';

function getLogTrace({
  level,
  date,
  workflowName,
  nodeName,
  message
}: GetServerLogs_logs_items) {
  return `${level}  [${date}] ${workflowName}:${nodeName} - ${message}`;
}

type Props = {
  clearLogs: () => void;
  toggleAutoScrollActive: () => void;
  runtimeId: string;
  versionId: string;
  autoScrollActive: boolean;
  logs: GetServerLogs_logs_items[];
};

function LogsFooter({
  clearLogs,
  toggleAutoScrollActive,
  autoScrollActive,
  runtimeId,
  versionId,
  logs
}: Props) {
  const followText = `${autoScrollActive ? 'UN' : ''}FOLLOW NEW LOGS`;

  function onDownloadLogs() {
    const filename = `logs_${runtimeId}_${versionId}_${new Date().toISOString()}`;
    const logTraces = logs.map(getLogTrace).join('\n');

    downloadFile(filename, logTraces);
  }

  return (
    <div className={styles.container}>
      <Left>
        <Button
          height={32}
          label="CLEAR"
          Icon={ClearIcon}
          onClick={clearLogs}
        />
      </Left>
      <Right className={styles.right}>
        <Button
          height={32}
          label={followText}
          Icon={FollowIcon}
          onClick={toggleAutoScrollActive}
          className={cx({ [styles.active]: autoScrollActive })}
        />
        <Button
          height={32}
          label={'DOWNLOAD'}
          Icon={DownloadIcon}
          onClick={onDownloadLogs}
          className={cx({ [styles.active]: autoScrollActive })}
        />
      </Right>
    </div>
  );
}

export default LogsFooter;
