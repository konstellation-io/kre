import React from 'react';

import IconClose from '@material-ui/icons/Close';
import IconStickBottom from '@material-ui/icons/VerticalAlignBottom';

import cx from 'classnames';
import styles from './Header.module.scss';

type Props = {
  runtimeName: string;
  versionName: string;
  closeLogs: () => void;
  opened: boolean;
  stickToBottom: boolean;
  toggleStickToBottom: () => void;
};
function Header({
  runtimeName,
  versionName,
  closeLogs,
  opened,
  stickToBottom,
  toggleStickToBottom
}: Props) {
  function scrollToBottom() {
    const listContainer = document.getElementById('VersionLogsListContainer');
    if (listContainer) {
      listContainer.scrollTo({
        top: listContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.statusCircle} />
      <span className={styles.runtime}>{runtimeName}</span>
      <span className={styles.version}>{versionName}</span>
      <div
        className={cx(styles.buttons, {
          [styles.opened]: opened
        })}
      >
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
