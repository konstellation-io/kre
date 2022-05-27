import { AccessLevel } from 'Graphql/types/globalTypes';
import { Button, ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetRuntimes,
  GetRuntimes_runtimes
} from 'Graphql/queries/types/GetRuntimes';
import React, { ReactElement } from 'react';

import { useQuery, ApolloError } from '@apollo/client';
import Can from 'Components/Can/Can';
import Hexagon from 'Components/Shape/Hexagon/Hexagon';
import HexagonBorder from 'Components/Shape/Hexagon/HexagonBorder';
import HexagonPanel from 'Components/Layout/HexagonPanel/HexagonPanel';
import { History } from 'history';
import Message from 'Components/Message/Message';
import PageBase from 'Components/Layout/PageBase/PageBase';
import ROUTE from 'Constants/routes';
import { buildRoute } from 'Utils/routes';
import { checkPermission } from 'rbac-rules';
import { get } from 'lodash';
import styles from './Dashboard.module.scss';
import { useHistory } from 'react-router';
import useUserAccess from 'Hooks/useUserAccess';
import GetRuntimesQuery from 'Graphql/queries/getRuntimes';

export enum VersionEnvStatus {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  ERROR = 'ERROR'
}

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
      status={"CREATED"}
      versionStatus={getVersionStatus(runtime)}
      title={runtime.name}
      info={[
        {
          type: '',
          date: runtime.creationDate
        }
      ]}
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

  let runtimesPanel: ReactElement = <HexagonPanel dataTestId={"runtimesList"}>{runtimes}</HexagonPanel>;
  if (runtimes.length === 0) {
    runtimesPanel = (
      <Message text="There are no created runtimes and you cannot create a new one. Wait for a Manager or Administrator to create one" />
    );
  }

  return <>{runtimesPanel}</>;
}

function Dashboard() {
  const { accessLevel } = useUserAccess();
  const history = useHistory();
  const { data, loading, error } = useQuery<GetRuntimes>(GetRuntimesQuery);
  const runtimes: GetRuntimes_runtimes[] = get(data, 'runtimes', []);
  const nRuntimes = runtimes === null ? 0 : runtimes.length;

  return (
    <PageBase
      headerChildren={
        <>
          <Can perform="runtime:edit">
            <Button
              label="ADD RUNTIME"
              to={ROUTE.NEW_RUNTIME}
              height={40}
              className={styles.addRuntime}
            />
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
