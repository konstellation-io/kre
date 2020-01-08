import { has } from 'lodash';

import React from 'react';
import { NavLink } from 'react-router-dom';

import styles from './NavBar.module.scss';
import cx from 'classnames';

export type Tab = {
  label: string;
  route: string;
  Icon?: any;
  exact?: boolean;
  disabled?: boolean;
};
type Props = {
  tabs: Tab[];
  defaultActive?: number;
};

function NavBar({ tabs }: Props) {
  function handleClick(event: any, disabled: boolean = false) {
    if (disabled) {
      event.preventDefault();
    }
  }

  const tabElements = tabs.map((tab, idx) => {
    const exact = has(tab, 'exact') ? tab.exact : true;
    return (
      <NavLink
        key={`NavBarItem_${idx}`}
        to={tab.route}
        activeClassName={styles.active}
        exact={exact}
        onClick={e => handleClick(e, tab.disabled)}
        className={cx({ [styles.disabled]: tab.disabled })}
        replace
      >
        <div className={cx(styles.item, { [styles.disabled]: tab.disabled })}>
          <tab.Icon className="icon-regular" />
          <span>{tab.label}</span>
        </div>
      </NavLink>
    );
  });

  return <div className={styles.container}>{tabElements}</div>;
}

export default NavBar;
