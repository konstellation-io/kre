import React from 'react';
import NavBar from '../NavBar/NavBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {ICON} from '../../icons';
import styles from './Sidebar.module.scss';
import { History } from 'history';

type Tab = {
  label: string,
  icon: IconProp
}
type Props = {
  title?: string,
  tabs?: Tab[];
  onChange?: Function;
  history?: History;
};

function Sidebar({
  title = 'Sidebar',
  onChange = function(idx:number) {},
  tabs = [],
  history
}:Props = {}) {
  function onBackButton() {
    if (history) {
      history.goBack();
    } else {
      console.error('Cannot access route history');
    }
  }
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
        />
      </div>
    </div>
  );
}

Sidebar.propTypes = {
};

export default Sidebar;
