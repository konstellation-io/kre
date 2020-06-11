import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { get } from 'lodash';
import React, { FunctionComponent, ReactElement } from 'react';
import Settings from '../../components/Settings/Settings';
import { GetMe } from '../../graphql/queries/types/GetMe';
import styles from './Header.module.scss';

const GetMeQuery = loader('../../graphql/queries/getMe.graphql');

type Props = {
  children?: ReactElement | ReactElement[] | null;
  hideSettings?: boolean;
};
const Header: FunctionComponent<Props> = ({
  children,
  hideSettings = false
}) => {
  const { data, loading } = useQuery<GetMe>(GetMeQuery);

  if (loading)
    return <div className={styles.splash} data-testid="splashscreen" />;

  const username: string = get(data, 'me.email');

  return (
    <header className={styles.container} data-testid="app-header">
      <img
        className={styles.konstellationText}
        src={'/img/brand/konstellation.svg'}
        alt="konstellation"
      />
      <div className={styles.customHeaderElements}>{children}</div>
      {!hideSettings && <Settings label={username} />}
    </header>
  );
};

export default Header;
