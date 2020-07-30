import { Button, Left, Right } from 'konstellation-web-components';

import ClearIcon from '@material-ui/icons/Block';
import FollowIcon from '@material-ui/icons/VerticalAlignBottom';
import React from 'react';
import cx from 'classnames';
import styles from './LogsFooter.module.scss';

type Props = {
  clearLogs: () => void;
  toggleAutoScrollActive: () => void;
  autoScrollActive: boolean;
};

function LogsFooter({
  clearLogs,
  toggleAutoScrollActive,
  autoScrollActive
}: Props) {
  const followText = `${autoScrollActive ? 'UN' : ''}FOLLOW NEW LOGS`;
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
      </Right>
    </div>
  );
}

export default LogsFooter;
