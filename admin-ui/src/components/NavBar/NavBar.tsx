import { has } from 'lodash';

import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavBar.module.scss';

export type Tab = {
  label: string;
  route: string;
  Icon?: any;
  exact?: boolean;
};
type Props = {
  tabs: Tab[];
  defaultActive?: number;
};

function NavBar({ tabs }: Props) {
  const tabElements = tabs.map((tab, idx) => {
    const exact = has(tab, 'exact') ? tab.exact : true;
    return (
      <NavLink
        key={`NavBarItem_${idx}`}
        to={tab.route}
        activeClassName={styles.active}
        exact={exact}
        replace
      >
        <div className={styles.item}>
          <tab.Icon className="icon-regular" />
          <span>{tab.label}</span>
        </div>
      </NavLink>
    );
  });

  return <div className={styles.container}>{tabElements}</div>;
}

export default NavBar;
