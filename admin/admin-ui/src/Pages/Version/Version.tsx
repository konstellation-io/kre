import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';
import React, { useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Configuration from './pages/Configuration/Configuration';
import Documentation from './pages/Documentation/Documentation';
import Metrics from './pages/Metrics/Metrics';
import ROUTE from 'Constants/routes';
import Status from './pages/Status/Status';
import VersionSideBar from './components/VersionSideBar/VersionSideBar';
import styles from './Version.module.scss';
import { useApolloClient } from '@apollo/react-hooks';

type Props = {
  versions?: GetVersionConfStatus_versions[];
  version?: GetVersionConfStatus_versions;
  runtime?: GetVersionConfStatus_runtime;
};

function Version({ versions, version, runtime }: Props) {
  const client = useApolloClient();

  useEffect(() => {
    if (runtime && version) {
      client.writeData({
        data: {
          openedVersion: {
            runtimeName: runtime.name,
            versionName: version.name,
            __typename: 'OpenedVersion'
          }
        }
      });
    }
  }, [version, runtime, client]);

  return (
    <div className={styles.container} data-testid="runtimeContainer">
      <VersionSideBar runtime={runtime} versions={versions} version={version} />
      <div className={styles.content}>
        <Switch>
          <Route
            exact
            path={ROUTE.RUNTIME_VERSION_STATUS}
            render={props => <Status {...props} version={version} />}
          />
          <Redirect
            exact
            from={ROUTE.RUNTIME_VERSION_DOCUMENTATION}
            to={ROUTE.RUNTIME_VERSION_DOCUMENTATION + '/README.md'}
          />
          <Route
            path={ROUTE.RUNTIME_VERSION_DOCUMENTATION}
            component={Documentation}
          />
          <Route
            exact
            path={ROUTE.RUNTIME_VERSION_CONFIGURATION}
            component={Configuration}
          />
          <Route
            exact
            path={ROUTE.RUNTIME_VERSION_METRICS}
            render={props => (
              <Metrics {...props} runtime={runtime} version={version} />
            )}
          />
        </Switch>
      </div>
    </div>
  );
}

export default Version;
