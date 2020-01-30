import styles from './VersionMenuItem.module.scss';
import React from 'react';
import { NavLink } from 'react-router-dom';
import IconWarning from '@material-ui/icons/Warning';
import cx from 'classnames';

export type VersionMenuItemProps = {
  label: string;
  to: string;
  exact?: boolean;
  warning?: string;
};

function VersionMenuItem({ label, to, exact, warning }: VersionMenuItemProps) {
  return (
    <NavLink to={to} activeClassName={styles.active} exact={exact} replace>
      <div className={styles.item}>
        <span>{label}</span>
        {warning && (
          <div title={warning}>
            <IconWarning className={cx('icon-regular', styles.warning)} />
          </div>
        )}
      </div>
    </NavLink>
  );
}

export default VersionMenuItem;
