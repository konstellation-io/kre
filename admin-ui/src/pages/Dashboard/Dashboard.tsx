import { get } from 'lodash';

import React from 'react';
import { useHistory } from 'react-router';
import { History } from 'history';
import * as PAGES from '../../constants/routes';

import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import HexagonPanel from '../../components/Layout/HexagonPanel/HexagonPanel';
import Hexagon from '../../components/Shape/Hexagon/Hexagon';
import HexagonBorder from '../../components/Shape/Hexagon/HexagonBorder';
import AlertMessage from '../../components/Alert/Alert';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';

import styles from './Dashboard.module.scss';

import { useQuery } from '@apollo/react-hooks';
import { GET_DASHBOARD, GetDashboardResponse } from './Dashboard.graphql';
import {
  Alert,
  Runtime,
  VersionEnvStatus,
  RuntimeStatus
} from '../../graphql/models';
import { ApolloError } from 'apollo-client';

const disabledRuntimeStatus = [RuntimeStatus.CREATING];

type Props = {
  data: GetDashboardResponse;
  error?: ApolloError;
  loading: boolean;
  history: History;
};

// TODO: Add ERROR state
// For now this label will only show ACTIVE for active versions and INACTIVE otherwise
function getVersionStatus(runtime: Runtime) {
  return runtime.activeVersion
    ? VersionEnvStatus.ACTIVE
    : VersionEnvStatus.INACTIVE;
}

function getDashboardContent({ data, error, loading, history }: Props) {
  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  // FIXME: remove when runtime response fixed
  const dataRuntimes = data.runtimes === null ? [] : data.runtimes;

  const runtimes = dataRuntimes.map((runtime: Runtime, idx: number) => (
    <Hexagon
      key={`runtimeHexagon-${idx}`}
      onClick={() => {
        const runtimePath = PAGES.RUNTIME.replace(':runtimeId', runtime.id);
        history.push(runtimePath);
      }}
      id={runtime.id}
      status={runtime.status}
      versionStatus={getVersionStatus(runtime)}
      title={runtime.name}
      info={[
        {
          type: 'active',
          date: runtime.creationDate
        }
      ]}
      disabled={disabledRuntimeStatus.includes(runtime.status)}
    />
  ));
  runtimes.push(
    <HexagonBorder
      text="+ ADD RUNTIME"
      key="add_runtime"
      onClick={() => history.push(PAGES.NEW_RUNTIME)}
    />
  );

  const alerts = data.alerts.map((alert: Alert, idx: number) => (
    <AlertMessage
      key={`runtimeAlert-${idx}`}
      type={alert.type}
      message={alert.message}
      runtimeId={alert.runtime.id}
    />
  ));

  let runtimesPanel: any = <HexagonPanel>{runtimes}</HexagonPanel>;
  if (runtimes.length === 0) {
    runtimesPanel = (
      <Modal
        title="THERE ARE NO RUNTIMES"
        message="Please, create a new runtime to start working on this dashboard"
        actionButtonLabel="NEW RUNTIME"
        to={PAGES.NEW_RUNTIME}
      />
    );
  }

  return (
    <>
      <div>{alerts}</div>
      {runtimesPanel}
    </>
  );
}

function Dashboard() {
  const history = useHistory();
  const { data, loading, error } = useQuery(GET_DASHBOARD);
  const runtimes = get(data, 'runtimes', []);
  const nRuntimes = runtimes === null ? 0 : runtimes.length;

  return (
    <>
      <Header>
        <Button label="ADD RUNTIME" to={PAGES.NEW_RUNTIME} height={40} />
        <div>{`${nRuntimes} runtimes shown`}</div>
      </Header>
      <div className={styles.container} data-testid="dashboardContainer">
        <NavigationBar />
        <div className={styles.content}>
          <div className={styles.hexagons}>
            {getDashboardContent({ data, error, loading, history })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
