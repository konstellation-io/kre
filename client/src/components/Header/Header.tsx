import React from 'react';
import Settings from '../../components/Settings/Settings';
import styles from './Header.module.scss';

function Header() {
  return (
    <header className={styles.container}>
      <img
        className={styles.konstellationsIcon}
        src={'img/brand/konstellation.svg'}
        alt='konstellation logo'
      />
      <Settings label={ 'mariano@intelygenz.com' } />
    </header>
  );
}

export default Header;
