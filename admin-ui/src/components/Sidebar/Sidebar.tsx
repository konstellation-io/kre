import React, { useRef } from 'react';
import { History, Location } from 'history';

import NavBar from '../NavBar/NavBar';
import LeftArrowIcon from '@material-ui/icons/KeyboardBackspace';

import styles from './Sidebar.module.scss';

export type Tab = {
  label: string;
  route: string;
  Icon?: any;
};
type Props = {
  title: string;
  subtitle?: string;
  tabs: Tab[];
  history: History;
  location: Location;
  onChange?: Function;
  subheader?: any;
};

function Sidebar({
  title,
  tabs,
  history,
  location,
  subtitle = '',
  onChange = function(idx: number) {},
  subheader = undefined
}: Props) {
  const backLocation = useRef(location.state && location.state.prevLocation);

  function onBackButton() {
    history.push(backLocation.current);
  }

  const actualRoute = location.pathname;
  const activeTab = tabs.map(tab => tab.route).indexOf(actualRoute);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.back} onClick={onBackButton}>
          <LeftArrowIcon style={{ fontSize: '1rem' }} />
          <span className={styles.title}>{title}</span>
        </div>
        <div className={styles.description}>{subtitle}</div>
      </div>
      {subheader}
      <div className={styles.navButtons}>
        <NavBar tabs={tabs} onChange={onChange} defaultActive={activeTab} />
      </div>
    </div>
  );
}

Sidebar.propTypes = {};

export default Sidebar;
