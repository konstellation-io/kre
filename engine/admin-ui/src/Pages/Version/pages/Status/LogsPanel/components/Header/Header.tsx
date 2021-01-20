import IconClose from '@material-ui/icons/ExpandMore';
import IconExpand from '@material-ui/icons/Fullscreen';
import IconExpandExit from '@material-ui/icons/FullscreenExit';
import IconOpen from '@material-ui/icons/ExpandLess';
import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { TERMINAL } from 'kwc';
import cx from 'classnames';
import styles from './Header.module.scss';

type Props = {
  togglePanel: () => void;
  toggleFullScreen: () => void;
  opened: boolean;
  fullScreen: boolean;
};
function Header({ togglePanel, toggleFullScreen, opened, fullScreen }: Props) {
  const IconOpenLogs = opened ? IconClose : IconOpen;
  const titleOpenLogs = opened ? 'Close logs panel' : 'Open logs panel';
  const IconFullScreen = fullScreen ? IconExpandExit : IconExpand;
  const titleFullScreen = fullScreen ? 'Contract' : 'Expand';

  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: opened
      })}
      onClick={() => !opened && togglePanel()}
      title="Open logs"
    >
      <div className={styles.title}>
        <SvgIcon className="icon-small">
          <path d={TERMINAL} />
        </SvgIcon>
        <span>LOGS CONSOLE</span>
      </div>
      <div className={styles.buttons}>
        {opened && (
          <div onClick={toggleFullScreen} title={titleFullScreen}>
            <IconFullScreen className="icon-regular" />
          </div>
        )}
        <div onClick={togglePanel} title={titleOpenLogs}>
          <IconOpenLogs className="icon-regular" />
        </div>
      </div>
    </div>
  );
}

export default Header;
