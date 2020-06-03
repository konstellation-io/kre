import { get } from 'lodash';

import React, { ReactElement } from 'react';
import { useHistory } from 'react-router';
import { History } from 'history';
import ROUTE from '../../constants/routes';

import HexagonPanel from '../../components/Layout/HexagonPanel/HexagonPanel';
import Hexagon from '../../components/Shape/Hexagon/Hexagon';
import HexagonBorder from '../../components/Shape/Hexagon/HexagonBorder';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Button from '../../components/Button/Button';
import ModalContainer from '../../components/Layout/ModalContainer/ModalContainer';
import ModalLayoutInfo from '../../components/Layout/ModalContainer/layouts/ModalLayoutInfo/ModalLayoutInfo';

import styles from './Dashboard.module.scss';

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  GetRuntimes,
  GetRuntimes_runtimes
} from '../../graphql/queries/types/GetRuntimes';
import { RuntimeStatus } from '../../graphql/types/globalTypes';
import { ApolloError } from 'apollo-client';
import { buildRoute } from '../../utils/routes';
import PageBase from '../../components/Layout/PageBase/PageBase';
import Can from '../../components/Can/Can';

const GetRuntimesQuery = loader('../../graphql/queries/getRuntimes.graphql');

export enum VersionEnvStatus {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  ERROR = 'ERROR'
}

const disabledRuntimeStatus = [RuntimeStatus.CREATING];

type Props = {
  data: GetRuntimes_runtimes[];
  error?: ApolloError;
  loading: boolean;
  history: History;
};

// For now this label will only show PUBLISHED for published versions and STARTED otherwise
function getVersionStatus(runtime: GetRuntimes_runtimes) {
  return runtime.publishedVersion
    ? VersionEnvStatus.PUBLISHED
    : VersionEnvStatus.UNPUBLISHED;
}

function getDashboardContent({ data, error, loading }: Props) {
  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  const runtimes = data.map((runtime: GetRuntimes_runtimes) => (
    <Hexagon
      key={runtime.name}
      to={buildRoute.runtime(ROUTE.RUNTIME, runtime.id)}
      id={runtime.id}
      status={runtime.status}
      versionStatus={getVersionStatus(runtime)}
      title={runtime.name}
      info={[
        {
          type: '',
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
      to={ROUTE.NEW_RUNTIME}
    />
  );

  let runtimesPanel: ReactElement = <HexagonPanel>{runtimes}</HexagonPanel>;
  if (runtimes.length === 0) {
    runtimesPanel = (
      <ModalContainer
        title="THERE ARE NO RUNTIMES"
        actionButtonLabel="NEW RUNTIME"
        to={ROUTE.NEW_RUNTIME}
      >
        <ModalLayoutInfo>
          Please, create a new runtime to start working on this dashboard
        </ModalLayoutInfo>
      </ModalContainer>
    );
  }

  return <>{runtimesPanel}</>;
}

function Dashboard() {
  const history = useHistory();
  const { data, loading, error } = useQuery<GetRuntimes>(GetRuntimesQuery, {
    fetchPolicy: 'cache-and-network'
  });
  const runtimes = get(data, 'runtimes', []);
  const nRuntimes = runtimes === null ? 0 : runtimes.length;

  return (
    <PageBase
      headerChildren={
        <>
          <Can perform="runtime:edit">
            <Button label="ADD RUNTIME" to={ROUTE.NEW_RUNTIME} height={40} />
          </Can>
          <div>{`${nRuntimes} runtime${nRuntimes > 1 ? 's' : ''} shown`}</div>
        </>
      }
    >
      <div className={styles.container} data-testid="dashboardContainer">
        <div className={styles.content}>
          <div className={styles.hexagons}>
            {getDashboardContent({ data: runtimes, error, loading, history })}
          </div>
        </div>
      </div>
    </PageBase>
  );
}

export default Dashboard;
