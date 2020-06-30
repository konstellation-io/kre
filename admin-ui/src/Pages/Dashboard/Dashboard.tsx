import { AccessLevel, RuntimeStatus } from 'Graphql/types/globalTypes';
import {
  GetRuntimes,
  GetRuntimes_runtimes
} from 'Graphql/queries/types/GetRuntimes';
import React, { ReactElement } from 'react';

import { ApolloError } from 'apollo-client';
import Button from 'Components/Button/Button';
import Can from 'Components/Can/Can';
import ErrorMessage from 'Components/ErrorMessage/ErrorMessage';
import Hexagon from 'Components/Shape/Hexagon/Hexagon';
import HexagonBorder from 'Components/Shape/Hexagon/HexagonBorder';
import HexagonPanel from 'Components/Layout/HexagonPanel/HexagonPanel';
import { History } from 'history';
import ModalContainer from 'Components/Layout/ModalContainer/ModalContainer';
import ModalLayoutInfo from 'Components/Layout/ModalContainer/layouts/ModalLayoutInfo/ModalLayoutInfo';
import PageBase from 'Components/Layout/PageBase/PageBase';
import ROUTE from 'Constants/routes';
import SpinnerCircular from 'Components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import { buildRoute } from 'Utils/routes';
import { checkPermission } from 'rbac-rules';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import styles from './Dashboard.module.scss';
import { useHistory } from 'react-router';
import { useQuery } from '@apollo/react-hooks';
import useUserAccess from 'Hooks/useUserAccess';

const GetRuntimesQuery = loader('../../Graphql/queries/getRuntimes.graphql');

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
  accessLevel: AccessLevel;
};

// For now this label will only show PUBLISHED for published versions and STARTED otherwise
function getVersionStatus(runtime: GetRuntimes_runtimes) {
  return runtime.publishedVersion
    ? VersionEnvStatus.PUBLISHED
    : VersionEnvStatus.UNPUBLISHED;
}

function getDashboardContent({ data, error, loading, accessLevel }: Props) {
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

  if (checkPermission(accessLevel, 'runtime:edit')) {
    runtimes.push(
      <HexagonBorder
        text="+ ADD RUNTIME"
        key="add_runtime"
        to={ROUTE.NEW_RUNTIME}
      />
    );
  }

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
  const { accessLevel } = useUserAccess();
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
            {getDashboardContent({
              data: runtimes,
              error,
              loading,
              history,
              accessLevel
            })}
          </div>
        </div>
      </div>
    </PageBase>
  );
}

export default Dashboard;
