import { get } from 'lodash';

import React from 'react';
import { buildRoute } from '../../utils/routes';

import { NavLink } from 'react-router-dom';

import ROUTE from '../../constants/routes';
import VerticalBar from '../Layout/VerticalBar/VerticalBar';
import HexButton from './HexButton';
import MultiHexButton from './MultiHexButton';
import AddHexButton from './AddHexButton';
import SpinnerCircular from '../LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

import { useQuery } from '@apollo/react-hooks';
import { GET_RUNTIMES } from '../../pages/Dashboard/Dashboard.graphql';
import { Runtime } from '../../graphql/models';

import styles from './NavigationBar.module.scss';

function NavigationBar() {
  const { data, loading, error } = useQuery(GET_RUNTIMES);

  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const runtimes = get(data, 'runtimes', []);

  const buttons = runtimes.map((runtime: Runtime, idx: number) => (
    <NavLink
      key={`NavBarItem_${idx}`}
      to={buildRoute.runtime(ROUTE.RUNTIME, runtime.id)}
      activeClassName={styles.active}
      className={styles.link}
    >
      <HexButton
        key={`navigationButton_${runtime.name}`}
        label={runtime.name}
      />
    </NavLink>
  ));

  buttons.unshift(
    <NavLink
      key={`NavBarItem_Runtimes`}
      to={ROUTE.HOME}
      activeClassName={styles.active}
      className={styles.link}
      exact={true}
    >
      <MultiHexButton key={`navigationButton_Runtimes`} />
    </NavLink>
  );

  buttons.push(
    <NavLink
      key={`NavBarItem_AddRuntime`}
      to={ROUTE.NEW_RUNTIME}
      activeClassName={styles.active}
      className={styles.link}
    >
      <AddHexButton key={`navigationButton_AddRuntime`} />
    </NavLink>
  );

  return (
    <VerticalBar>
      <div className={styles.container}>{buttons}</div>
    </VerticalBar>
  );
}

export default NavigationBar;
