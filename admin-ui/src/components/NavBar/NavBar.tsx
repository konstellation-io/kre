import { has } from 'lodash';

import React, { MouseEvent, FunctionComponent } from 'react';
import IconWarning from '@material-ui/icons/Warning';
import IconArrowForward from '@material-ui/icons/ArrowForward';
import { NavLink } from 'react-router-dom';

import styles from './NavBar.module.scss';
import cx from 'classnames';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

export enum ItemSize {
  SMALL = 'size_s',
  MEDIUM = 'size_m'
}

export type Tab = {
  label: string;
  route: string;
  Icon?: FunctionComponent<SvgIconProps>;
  exact?: boolean;
  disabled?: boolean;
  showWarning?: boolean;
  warningTitle?: string;
};
type Props = {
  tabs: Tab[];
  itemSize?: ItemSize;
  showItemArrows?: boolean;
};

function NavBar({
  tabs,
  itemSize = ItemSize.MEDIUM,
  showItemArrows = false
}: Props) {
  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
    disabled: boolean = false
  ) {
    if (disabled) {
      event.preventDefault();
    }
  }

  const tabElements = tabs.map(tab => {
    const exact = has(tab, 'exact') ? tab.exact : true;
    return (
      <NavLink
        key={`${tab.label}-${tab.route}`}
        to={tab.route}
        activeClassName={styles.active}
        exact={exact}
        onClick={(e: MouseEvent<HTMLAnchorElement>) =>
          handleClick(e, tab.disabled)
        }
        className={cx({ [styles.disabled]: tab.disabled })}
        replace
      >
        <div
          className={cx(
            styles.item,
            { [styles.disabled]: tab.disabled },
            styles[itemSize]
          )}
        >
          {tab.Icon && <tab.Icon className="icon-regular" />}
          <span>{tab.label}</span>
          {showItemArrows && (
            <div className={styles.arrow}>
              <IconArrowForward className="icon-regular" />
            </div>
          )}
          {tab.showWarning && (
            <div title={tab.warningTitle}>
              <IconWarning className={cx('icon-regular', styles.warning)} />
            </div>
          )}
        </div>
      </NavLink>
    );
  });

  return <div>{tabElements}</div>;
}

export default NavBar;
