import React from 'react';

import IconOpen from '@material-ui/icons/ExpandLess';
import IconClose from '@material-ui/icons/ExpandMore';
import * as ICONS from '../../../../../../../constants/icons';

import cx from 'classnames';
import styles from './Header.module.scss';
import SvgIcon from '@material-ui/core/SvgIcon';

type Props = {
  togglePanel: () => void;
  opened: boolean;
};
function Header({ togglePanel, opened }: Props) {
  const Icon = opened ? IconClose : IconOpen;

  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: opened
      })}
    >
      <div className={styles.title}>
        <SvgIcon className="icon-small">
          <path d={ICONS.TERMINAL} />
        </SvgIcon>
        <span>LOGS CONSOLE</span>
      </div>
      <div className={styles.buttons}>
        <div onClick={togglePanel}>
          <Icon className="icon-regular" />
        </div>
      </div>
    </div>
  );
}

export default Header;
