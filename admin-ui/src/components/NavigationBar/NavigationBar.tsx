import { get } from 'lodash';

import React from 'react';
import { buildRoute } from '../../utils/routes';

import { NavLink } from 'react-router-dom';

import ROUTE from '../../constants/routes';
import VerticalBar from '../Layout/VerticalBar/VerticalBar';
import ConditionalLink from '../ConditionalLink/ConditionalLink';
import HexButton from './HexButton';
import MultiHexButton from './MultiHexButton';
import AddHexButton from './AddHexButton';
import SpinnerCircular from '../LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  GetRuntimes,
  GetRuntimes_runtimes
} from '../../graphql/queries/types/GetRuntimes';

import styles from './NavigationBar.module.scss';
import { RuntimeStatus } from '../../graphql/types/globalTypes';
import { checkPermission } from '../../rbac-rules';
import useUserAccess from '../../hooks/useUserAccess';

const GetRuntimesQuery = loader('../../graphql/queries/getRuntimes.graphql');

function NavigationBar() {
  const { accessLevel } = useUserAccess();
  const { data, loading, error } = useQuery<GetRuntimes>(GetRuntimesQuery);

  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const runtimes: GetRuntimes_runtimes[] = get(data, 'runtimes', []);

  const buttons = runtimes.map((runtime: GetRuntimes_runtimes) => {
    const disabled = runtime.status === RuntimeStatus.CREATING;
    return (
      <ConditionalLink
        key={runtime.name}
        LinkType={NavLink}
        to={buildRoute.runtime(ROUTE.RUNTIME, runtime.id)}
        disabled={disabled}
        linkProps={{
          activeClassName: styles.active,
          className: styles.link
        }}
      >
        <HexButton label={runtime.name} disabled={disabled} />
      </ConditionalLink>
    );
  });

  buttons.unshift(
    <NavLink
      key={`NavBarItem_Runtimes`}
      to={ROUTE.HOME}
      activeClassName={styles.active}
      className={styles.link}
      exact={true}
    >
      <MultiHexButton />
    </NavLink>
  );

  if (checkPermission(accessLevel, 'runtime:edit')) {
    buttons.push(
      <NavLink
        key={`NavBarItem_AddRuntime`}
        to={ROUTE.NEW_RUNTIME}
        activeClassName={styles.active}
        className={styles.link}
      >
        <AddHexButton />
      </NavLink>
    );
  }

  return (
    <VerticalBar>
      <div className={styles.container} data-testid="navigation-bar">
        {buttons}
      </div>
    </VerticalBar>
  );
}

export default NavigationBar;
