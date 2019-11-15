import React, { FunctionComponent } from 'react';

import Settings from '../../components/Settings/Settings';

import { useQuery } from '@apollo/react-hooks';
import { GET_USERNAME } from './dataModels';

import styles from './Header.module.scss';

type Props = {
  children?: any;
};
const Header: FunctionComponent<Props> = ({ children }) => {
  const { data, error, loading } = useQuery(GET_USERNAME);

  if (loading || error)
    return <div className={styles.splash} data-testid={'splashscreen'} />;

  const username = data.me.email;

  return (
    <header className={styles.container}>
      <img
        className={styles.konstellationsIcon}
        src={'/img/brand/konstellation.svg'}
        alt="konstellation logo"
      />
      <div className={styles.customHeaderElements}>{children}</div>
      <Settings label={username} />
    </header>
  );
};

export default Header;
