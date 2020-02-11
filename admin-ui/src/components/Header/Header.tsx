import React, { FunctionComponent } from 'react';

import Settings from '../../components/Settings/Settings';

import { useQuery, useApolloClient } from '@apollo/react-hooks';

import { GET_USER_EMAIL, GetUserEmailResponse } from './Header.graphql';

import styles from './Header.module.scss';

type Props = {
  children?: any;
};
const Header: FunctionComponent<Props> = ({ children }) => {
  const client = useApolloClient();
  const { data, error, loading } = useQuery<GetUserEmailResponse>(
    GET_USER_EMAIL
  );

  if (loading)
    return <div className={styles.splash} data-testid={'splashscreen'} />;

  const username = data && !error ? data.me.email : 'unknown';

  if (username !== 'unknown') {
    client.writeData({ data: { loggedIn: true } });
  }

  return (
    <header className={styles.container}>
      <img
        className={styles.konstellationsIcon}
        src={'/img/brand/konstellation.png'}
        alt="konstellation logo"
      />
      <div className={styles.customHeaderElements}>{children}</div>
      <Settings label={username} />
    </header>
  );
};

export default Header;
