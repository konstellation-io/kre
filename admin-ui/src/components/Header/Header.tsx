import React, { FunctionComponent } from 'react';

import Settings from '../../components/Settings/Settings';

import { useQuery } from '@apollo/react-hooks';
import { GET_USER_EMAIL, GetUserEmailResponse } from './Header.graphql';

import { connect } from 'react-redux';
import { login } from '../../actions/appActions';
import { AppState } from '../../reducers/appReducer';

import styles from './Header.module.scss';

type Props = {
  children?: any;
  login: Function;
  loggedIn?: boolean;
};
const Header: FunctionComponent<Props> = ({ children, login, loggedIn }) => {
  const { data, error, loading } = useQuery<GetUserEmailResponse>(
    GET_USER_EMAIL
  );

  if (loading)
    return <div className={styles.splash} data-testid={'splashscreen'} />;

  const username = data && !error ? data.me.email : 'unknown';

  if (username !== 'unknown' && !loggedIn) {
    login();
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

const mapStateToProps = (state: { app: AppState }) => ({
  loggedIn: state.app.loggedIn
});
const mapDispatchToProps = {
  login
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
