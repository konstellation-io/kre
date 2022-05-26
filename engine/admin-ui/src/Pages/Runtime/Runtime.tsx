import { Button, ErrorMessage, SpinnerCircular } from 'kwc';
import ROUTE, { VersionRouteParams } from 'Constants/routes';
import React, { ReactElement } from 'react';
import { Route, Switch, useLocation, useParams } from 'react-router-dom';

import Can from 'Components/Can/Can';
import { GetVersionConfStatus } from 'Graphql/queries/types/GetVersionConfStatus';
import PageBase from 'Components/Layout/PageBase/PageBase';
import RuntimeVersions from './pages/RuntimeVersions/RuntimeVersions';
import Version from '../Version/Version';
import styles from './Runtime.module.scss';
import { useQuery } from '@apollo/client';

import GetRuntimeAndVersionQuery from 'Graphql/queries/getRuntimeAndVersions';
import {buildRoute} from "../../Utils/routes";

function Runtime() {
  const { runtimeId, versionName } = useParams<VersionRouteParams>();
  const location = useLocation();
  const { data, loading, error } = useQuery<GetVersionConfStatus>(
    GetRuntimeAndVersionQuery, {
      variables: {
        runtimeId,
      },
    },
  );

  function getContent(): ReactElement | null {
    if (loading) return <SpinnerCircular />;
    if (error) return <ErrorMessage />;
    if (!data) return null;

    const runtime = data.runtime;
    const versions = data.versions;
    const version = versions.find(v => v.name === versionName);

    return (
      <>
        <div className={styles.content}>
          <Switch>
            <Route
              exact
              path={ROUTE.VERSIONS}
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
    ROUTE.VERSIONS,
    runtimeId
  );

  const isUserInVersions: boolean = location.pathname === versionsPath;

  return (
    <PageBase
      headerChildren={
        (isUserInVersions && (
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
