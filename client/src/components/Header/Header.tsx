import React from 'react';
import {withRouter} from 'react-router-dom';
import Settings from '../../components/Settings/Settings';
import styles from './Header.module.scss';

type Props = {
  location?: any;
};

function Header({ location = '' }: Props = {}) {
  return (
    <header className={styles.container}>
      <img className={styles.konstellationsIcon} src={'img/brand/konstellation.svg'}/>
      <Settings label={ 'mariano@intelygenz.com' } />
    </header>
  );
}

export default withRouter(Header);
