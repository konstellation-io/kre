import { get } from 'lodash';

import React from 'react';
import { useHistory } from 'react-router';
import { History } from 'history';
import ROUTE from '../../constants/routes';

import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import HexagonPanel from '../../components/Layout/HexagonPanel/HexagonPanel';
import Hexagon from '../../components/Shape/Hexagon/Hexagon';
import HexagonBorder from '../../components/Shape/Hexagon/HexagonBorder';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';

import styles from './Dashboard.module.scss';

import { useQuery } from '@apollo/react-hooks';
import { GET_RUNTIMES } from './Dashboard.graphql';
import { Runtime, RuntimeStatus, VersionEnvStatus } from '../../graphql/models';
import { ApolloError } from 'apollo-client';

const disabledRuntimeStatus = [RuntimeStatus.CREATING];

type Props = {
  data: Runtime[];
  error?: ApolloError;
  loading: boolean;
  history: History;
};

// TODO: Add ERROR state
// For now this label will only show PUBLISHED for published versions and STARTED otherwise
function getVersionStatus(runtime: Runtime) {
  return runtime.publishedVersion
    ? VersionEnvStatus.PUBLISHED
    : VersionEnvStatus.UNPUBLISHED;
}

function getDashboardContent({ data, error, loading, history }: Props) {
  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  const runtimes = data.map((runtime: Runtime, idx: number) => (
    <Hexagon
      key={`runtimeHexagon-${idx}`}
      onClick={() => {
        const runtimePath = ROUTE.RUNTIME.replace(':runtimeId', runtime.id);
        history.push(runtimePath);
      }}
      id={runtime.id}
      status={runtime.status}
      versionStatus={getVersionStatus(runtime)}
      title={runtime.name}
      info={[
        {
          type: 'created',
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
      onClick={() => history.push(ROUTE.NEW_RUNTIME)}
    />
  );

  let runtimesPanel: any = <HexagonPanel>{runtimes}</HexagonPanel>;
  if (runtimes.length === 0) {
    runtimesPanel = (
      <Modal
        title="THERE ARE NO RUNTIMES"
        message="Please, create a new runtime to start working on this dashboard"
        actionButtonLabel="NEW RUNTIME"
        to={ROUTE.NEW_RUNTIME}
      />
    );
  }

  return <>{runtimesPanel}</>;
}

function Dashboard() {
  const history = useHistory();
  const { data, loading, error } = useQuery(GET_RUNTIMES, {
    fetchPolicy: 'cache-and-network'
  });
  const runtimes = get(data, 'runtimes', []);
  const nRuntimes = runtimes === null ? 0 : runtimes.length;

  return (
    <>
      <Header>
        <Button label="ADD RUNTIME" to={ROUTE.NEW_RUNTIME} height={40} />
        <div>{`${nRuntimes} runtimes shown`}</div>
      </Header>
      <div className={styles.container} data-testid="dashboardContainer">
        <NavigationBar />
        <div className={styles.content}>
          <div className={styles.hexagons}>
            {getDashboardContent({ data: runtimes, error, loading, history })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
