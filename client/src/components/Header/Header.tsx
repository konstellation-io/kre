import React, {FunctionComponent} from 'react';
import Settings from '../../components/Settings/Settings';
import styles from './Header.module.scss';


type Props = {
  children?: any;
};
const Header: FunctionComponent<Props> = ({ children }) => (
  <header className={styles.container}>
      <img
        className={styles.konstellationsIcon}
        src={'/img/brand/konstellation.svg'}
        alt='konstellation logo'
      />
      <div className={styles.customHeaderElements}>
        {children}
      </div>
      <Settings label={ 'mariano@intelygenz.com' } />
    </header>
);

export default Header;
