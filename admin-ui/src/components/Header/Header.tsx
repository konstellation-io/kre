import React, { FunctionComponent } from 'react';

import Settings from '../../components/Settings/Settings';

import { loader } from 'graphql.macro';
import { useQuery, useApolloClient } from '@apollo/react-hooks';

import { GetUserEmail } from '../../graphql/queries/types/GetUserEmail';

import styles from './Header.module.scss';

const GetUserEmailQuery = loader('../../graphql/queries/getUserEmail.graphql');

type Props = {
  children?: any;
};
const Header: FunctionComponent<Props> = ({ children }) => {
  const client = useApolloClient();
  const { data, error, loading } = useQuery<GetUserEmail>(GetUserEmailQuery);

  if (loading)
    return <div className={styles.splash} data-testid={'splashscreen'} />;

  const username = data && data.me && !error ? data.me.email : 'unknown';

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
