import React from 'react';

import IconOpen from '@material-ui/icons/ExpandLess';
import IconClose from '@material-ui/icons/ExpandMore';
import IconStickBottom from '@material-ui/icons/VerticalAlignBottom';
import IconClear from '@material-ui/icons/DeleteOutline';
import IconLogs from '@material-ui/icons/ListAlt';

import cx from 'classnames';
import styles from './Header.module.scss';

type Props = {
  togglePanel: () => void;
  opened: boolean;
  stickToBottom: boolean;
  toggleStickToBottom: () => void;
  onClearClick: Function;
};
function Header({
  togglePanel,
  opened,
  stickToBottom,
  toggleStickToBottom,
  onClearClick
}: Props) {
  const Icon = opened ? IconClose : IconOpen;

  function clearLogs(): void {
    onClearClick();
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
        <div onClick={togglePanel}>
          <Icon className="icon-regular" />
        </div>
      </div>
    </div>
  );
}

export default Header;
