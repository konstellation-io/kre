import React, { FunctionComponent, ReactElement, memo } from 'react';

import { GetMe } from 'Graphql/queries/types/GetMe';
import Settings from 'Components/Settings/Settings';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import styles from './Header.module.scss';
import { useQuery } from '@apollo/react-hooks';

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

  if (loading)
    return <div className={styles.splash} data-testid="splashscreen" />;

  const username = get(data?.me, 'email', '');

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

export default memo(Header);
