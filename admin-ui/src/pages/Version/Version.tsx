import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ROUTE from '../../constants/routes';

import Status from './pages/Status/Status';
import Configuration from './pages/Configuration/Configuration';
import Metrics from './pages/Metrics/Metrics';
import VersionSideBar from './components/VersionSideBar/VersionSideBar';

import {
  GetVersionConfStatus_versions,
  GetVersionConfStatus_runtime
} from '../../graphql/queries/types/GetVersionConfStatus';

import styles from './Version.module.scss';

type Props = {
  version?: GetVersionConfStatus_versions;
  runtime?: GetVersionConfStatus_runtime;
  refetch: Function;
};

function Version({ version, runtime, refetch }: Props) {
  return (
    <div className={styles.container} data-testid="runtimeContainer">
      <VersionSideBar runtime={runtime} version={version} />
      <div className={styles.content}>
        <Switch>
          <Route
            exact
            path={ROUTE.RUNTIME_VERSION_STATUS}
            render={props => <Status {...props} version={version} />}
          />
          <Route
            exact
            path={ROUTE.RUNTIME_VERSION_CONFIGURATION}
            render={props => (
              <Configuration {...props} refetchVersion={refetch} />
            )}
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
