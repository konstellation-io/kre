import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';

import NavBar, { Tab } from '../NavBar/NavBar';
import LeftArrowIcon from '@material-ui/icons/KeyboardBackspace';

import styles from './Sidebar.module.scss';

type Props = {
  title: string;
  subtitle?: string;
  tabs: Tab[];
  subheader?: ReactElement;
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
