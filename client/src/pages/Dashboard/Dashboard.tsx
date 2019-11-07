import React from 'react';
import * as PAGES from '../../constants/routes';

import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import HexagonPanel from '../../components/Layout/HexagonPanel/HexagonPanel';
import Hexagon from '../../components/Shape/Hexagon/Hexagon';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';

import styles from './Dashboard.module.scss';

import { useQuery } from '@apollo/react-hooks';
import { formatRuntime, formatAlert } from './dataModel';
import {GET_DASHBOARD} from './dataModel';


function Dashboard() {
  const { data, loading, error } = useQuery(GET_DASHBOARD);

  function getContent() {
    if (error) return <p>ERROR</p>;
    if (loading) return <Spinner />;

    const runtimes = data.dashboard.runtimes.map((runtime:any, idx:number) => (
      <Hexagon
        key={`runtimeHexagon-${idx}`}
        {...formatRuntime(runtime)}
      />
    ));
    const alerts = data.dashboard.alerts.map((alert:any, idx:number) => (
      <Alert
        key={`runtimeAlert-${idx}`}
        {...formatAlert(alert)}
      />
    ));

    return <>
      <div>
        { alerts }
      </div>
      <HexagonPanel>{runtimes}</HexagonPanel>
    </>;
  }

  const nRuntimes = data && data.dashboard ? data.dashboard.runtimes.length : 0;

  return (
    <>
      <Header>
        <Button
          label='ADD RUNTIME'
          to={PAGES.NEW_RUNTIME}
          height={40}
        />
        <div>{ `${nRuntimes} runtimes shown` }</div>
      </Header>
      <div className={styles.container} data-testid="dashboardContainer">
        <NavigationBar />
        <div className={styles.content}>
          <div className={styles.hexagons}>
            { getContent() }
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
