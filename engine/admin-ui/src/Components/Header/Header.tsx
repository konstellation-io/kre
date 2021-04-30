import React, { FunctionComponent, ReactElement, memo } from 'react';

import { GetMe } from 'Graphql/queries/types/GetMe';
import Settings from 'Components/Settings/Settings';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import styles from './Header.module.scss';
import { useQuery } from '@apollo/client';
import ROUTE from "Constants/routes";
import { Link, useRouteMatch } from 'react-router-dom';
import cx from 'classnames';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');

type Props = {
  children?: ReactElement | ReactElement[] | null;
  hideSettings?: boolean;
};
const Header: FunctionComponent<Props> = ({
  children,
  hideSettings = false
}) => {
  const { data, loading } = useQuery<GetMe>(GetMeQuery);
  const isAtVersions = useRouteMatch(ROUTE.VERSIONS)?.isExact;

  if (loading)
    return <div className={styles.splash} data-testid="splashscreen" />;

  const username = get(data?.me, 'email', '');

  return (
    <header className={styles.container} data-testid="app-header">
      <Link to={ROUTE.HOME} className={cx({[styles.linkDisabled]: isAtVersions})}>
        <img
          className={styles.konstellationText}
          src={'/img/brand/konstellation.svg'}
          alt="konstellation"
        />
      </Link>
      <div className={styles.customHeaderElements}>{children}</div>
      {!hideSettings && <Settings label={username} />}
    </header>
  );
};

export default memo(Header);
