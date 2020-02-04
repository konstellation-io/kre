import React from 'react';

import IconClose from '@material-ui/icons/Close';
import IconStickBottom from '@material-ui/icons/VerticalAlignBottom';

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
  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: opened
      })}
    >
      <div className={styles.title}>LOGS CONSOLE</div>
      <div className={styles.buttons}>
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
