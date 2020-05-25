import { get } from 'lodash';

import React, { FunctionComponent, ReactElement } from 'react';

import Settings from '../../components/Settings/Settings';

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';

import { GetUserEmail } from '../../graphql/queries/types/GetUserEmail';

import styles from './Header.module.scss';

const GetUserEmailQuery = loader('../../graphql/queries/getUserEmail.graphql');

type Props = {
  children?: ReactElement | ReactElement[] | null;
  hideSettings?: boolean;
};
const Header: FunctionComponent<Props> = ({
  children,
  hideSettings = false
}) => {
  const { data, loading } = useQuery<GetUserEmail>(GetUserEmailQuery);

  if (loading)
    return <div className={styles.splash} data-testid="splashscreen" />;

  const username: string = get(data, 'me.email');

  return (
    <header className={styles.container} data-testid="app-header">
      <img
        className={styles.konstellationIcon}
        src={'/img/brand/favicon-light-128.png'}
        alt="konstellation icon"
      />
      <img
        className={styles.konstellationText}
        src={'/img/brand/konstellation.png'}
        alt="konstellation text"
      />
      <div className={styles.customHeaderElements}>{children}</div>
      {!hideSettings && <Settings label={username} />}
    </header>
  );
};

export default Header;
