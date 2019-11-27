import React from 'react';
import { useHistory } from 'react-router-dom';

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
  subheader?: any;
};

function Sidebar({ title, tabs, subtitle = '', subheader = undefined }: Props) {
  const history = useHistory();

  function onBackButton() {
    history.goBack();
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.back} onClick={onBackButton}>
          <LeftArrowIcon className="icon-regular" />
          <span className={styles.title}>{title}</span>
        </div>
        <div className={styles.description}>{subtitle}</div>
      </div>
      {subheader}
      <div className={styles.navButtons}>
        <NavBar tabs={tabs} />
      </div>
    </div>
  );
}

export default Sidebar;
