import {
  Button,
  ErrorMessage,
  SpinnerCircular
} from 'konstellation-web-components';
import {
  GetVersionConfStatus,
  GetVersionConfStatusVariables
} from 'Graphql/queries/types/GetVersionConfStatus';
import ROUTE, { VersionRouteParams } from 'Constants/routes';
import React, { ReactElement } from 'react';
import { Route, Switch, useLocation, useParams } from 'react-router-dom';

import Can from 'Components/Can/Can';
import PageBase from 'Components/Layout/PageBase/PageBase';
import RuntimeVersions from './pages/RuntimeVersions/RuntimeVersions';
import Version from '../Version/Version';
import { buildRoute } from 'Utils/routes';
import { loader } from 'graphql.macro';
import styles from './Runtime.module.scss';
import { useQuery } from '@apollo/react-hooks';

const GetRuntimeAndVersionQuery = loader(
  'Graphql/queries/getRuntimeAndVersions.graphql'
);

function Runtime() {
  const { runtimeId, versionId } = useParams<VersionRouteParams>();
  const location = useLocation();
  const { data, loading, error } = useQuery<
    GetVersionConfStatus,
    GetVersionConfStatusVariables
  >(GetRuntimeAndVersionQuery, {
    fetchPolicy: 'cache-and-network',
    variables: { runtimeId }
  });

  function getContent(): ReactElement | null {
    if (loading) return <SpinnerCircular />;
    if (error) return <ErrorMessage />;
    if (!data) return null;

    const runtime = data.runtime;
    const versions = data.versions;
    const version = versions.find(v => v.id === versionId);

    return (
      <>
        <div className={styles.content}>
          <Switch>
            <Route
              exact
              path={ROUTE.RUNTIME_VERSIONS}
              render={props => (
                <RuntimeVersions
                  {...props}
                  runtime={runtime}
                  versions={versions}
                />
              )}
            />
            <Route
              render={props => (
                <Version
                  {...props}
                  version={version}
                  versions={versions}
                  runtime={runtime}
                />
              )}
            />
          </Switch>
        </div>
      </>
    );
  }

  const newVersionRoute = buildRoute.runtime(ROUTE.NEW_VERSION, runtimeId);

  const versionsPath: string = buildRoute.runtime(
    ROUTE.RUNTIME_VERSIONS,
    runtimeId
  );
  const isUserInRuntimeVersions: boolean = location.pathname === versionsPath;

  return (
    <PageBase
      headerChildren={
        (isUserInRuntimeVersions && (
          <Can perform="version:edit">
            <Button label="ADD VERSION" height={40} to={newVersionRoute} />
          </Can>
        )) ||
        null
      }
    >
      {getContent()}
    </PageBase>
  );
}

export default Runtime;
