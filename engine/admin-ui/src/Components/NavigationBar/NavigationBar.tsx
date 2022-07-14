import { ErrorMessage, SpinnerCircular, VerticalBar } from 'kwc';
import {
  GetRuntimes,
  GetRuntimes_runtimes
} from 'Graphql/queries/types/GetRuntimes';
import React, { memo } from 'react';

import AddHexButton from './AddHexButton';
import ConditionalLink from '../ConditionalLink/ConditionalLink';
import HexButton from './HexButton';
import MultiHexButton from './MultiHexButton';
import { NavLink } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import { buildRoute } from 'Utils/routes';
import { checkPermission } from 'rbac-rules';
import { get } from 'lodash';
import styles from './NavigationBar.module.scss';
import { useQuery } from '@apollo/client';
import useUserAccess from 'Hooks/useUserAccess';

import GetRuntimesQuery from 'Graphql/queries/getRuntimes';

function NavigationBar() {
  const { accessLevel } = useUserAccess();
  const { data, loading, error } = useQuery<GetRuntimes>(GetRuntimesQuery);

  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const runtimes: GetRuntimes_runtimes[] = get(data, 'runtimes', []);

  const buttons = runtimes.map((runtime: GetRuntimes_runtimes) => {
    return (
      <ConditionalLink
        key={runtime.name}
        LinkType={NavLink}
        to={buildRoute.runtime(ROUTE.RUNTIME, runtime.id)}
        linkProps={{
          activeClassName: styles.active,
          className: styles.link
        }}
      >
        <HexButton label={runtime.name} />
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

export default memo(NavigationBar);
