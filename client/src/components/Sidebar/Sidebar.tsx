import React from 'react';
import { History, Location } from 'history';

import NavBar from '../NavBar/NavBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {ICON} from '../../icons';

import styles from './Sidebar.module.scss';


export type Tab = {
  label: string,
  route: string
  icon?: IconProp,
}
type Props = {
  title: string,
  tabs: Tab[];
  history: History;
  location: Location;
  onChange?: Function;
};

function Sidebar({
  title,
  tabs,
  history,
  location,
  onChange = function(idx:number) {},
}:Props) {
  function onBackButton() {
    history.goBack();
  }

  const actualRoute = location.pathname;
  const activeTab = tabs.map(tab => tab.route).indexOf(actualRoute);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.back} onClick={onBackButton}>
         <FontAwesomeIcon icon={ICON.LEFT} size='xs' />
          { title }
        </div>
        <div className={styles.description}>
          Fusce vehicula dolor arcu, sit amet.
        </div>
      </div>
      <div>
        <NavBar
          tabs={tabs}
          onChange={onChange}
          defaultActive={activeTab}
        />
      </div>
    </div>
  );
}

Sidebar.propTypes = {
};

export default Sidebar;
