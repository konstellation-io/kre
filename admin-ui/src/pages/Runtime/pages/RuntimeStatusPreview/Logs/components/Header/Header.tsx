import React from 'react';

import IconClose from '@material-ui/icons/Close';
import IconStickBottom from '@material-ui/icons/VerticalAlignBottom';
import IconClear from '@material-ui/icons/DeleteOutline';
import IconLogs from '@material-ui/icons/ListAlt';

import { useApolloClient } from '@apollo/react-hooks';

import cx from 'classnames';
import styles from './Header.module.scss';

type Props = {
  closeLogs: () => void;
  opened: boolean;
  stickToBottom: boolean;
  toggleStickToBottom: () => void;
};
function Header({
  closeLogs,
  opened,
  stickToBottom,
  toggleStickToBottom
}: Props) {
  const client = useApolloClient();

  function clearLogs(): void {
    client.writeData({ data: { clearLogs: true } });
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: opened
      })}
    >
      <div className={styles.title}>
        <IconLogs className="icon-regular" />
        <span>Logs console</span>
      </div>
      <div className={styles.buttons}>
        <div onClick={clearLogs}>
          <IconClear className="icon-regular" />
        </div>
        <div
          className={cx(styles.stickBottom, { [styles.active]: stickToBottom })}
          onClick={toggleStickToBottom}
        >
          <IconStickBottom className="icon-regular" />
        </div>
        <div onClick={closeLogs}>
          <IconClose className="icon-regular" />
        </div>
      </div>
    </div>
  );
}

export default Header;
