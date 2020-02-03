import React from 'react';
import { Route, Switch, useParams, useLocation } from 'react-router-dom';
import ROUTE from '../../constants/routes';
import { buildRoute } from '../../utils/routes';

import RuntimeStatusPreview from './pages/RuntimeStatusPreview/RuntimeStatusPreview';
import RuntimeConfiguration from './pages/RuntimeConfiguration/RuntimeConfiguration';
import RuntimeMetrics from './pages/RuntimeMetrics/RuntimeMetrics';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import Button from '../../components/Button/Button';
import LateralMenu from './components/LateralMenu/LateralMenu';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_RUNTIME_AND_VERSIONS,
  GetRuntimeAndVersionsResponse,
  GetRuntimeAndVersionsVars
} from './Runtime.graphql';

import cx from 'classnames';
import styles from './Runtime.module.scss';
import RuntimeVersions from './pages/RuntimeVersions/RuntimeVersions';

function Runtime() {
  const { runtimeId, versionId } = useParams();
  const location = useLocation();
  const { data, loading, error, refetch } = useQuery<
    GetRuntimeAndVersionsResponse,
    GetRuntimeAndVersionsVars
  >(GET_RUNTIME_AND_VERSIONS, {
    fetchPolicy: 'cache-and-network',
    variables: { runtimeId }
  });

  const newVersionRoute = buildRoute.runtime(ROUTE.NEW_VERSION, runtimeId);

  const statusPath: string = buildRoute.version(
    ROUTE.RUNTIME_VERSION_STATUS,
    runtimeId,
    versionId
  );
  const isUserInVersionStatus: boolean = location.pathname === statusPath;

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error) return <ErrorMessage />;
    if (!data) return null;

    const runtime = data.runtime;
    const versions = data.versions;
    const version = versions.find(v => v.id === versionId);

    return (
      <>
        {version && (
          <LateralMenu
            runtime={runtime}
            versions={versions}
            version={version}
          />
        )}
        <div className={styles.content}>
          <Switch>
            <Route
              exact
              path={ROUTE.RUNTIME_VERSIONS}
              render={props => <RuntimeVersions />}
            />
            <Route
              exact
              path={ROUTE.RUNTIME_VERSION_STATUS}
              render={props => (
                <RuntimeStatusPreview
                  {...props}
                  runtime={runtime}
                  version={version}
                />
              )}
            />
            <Route
              exact
              path={ROUTE.RUNTIME_VERSION_CONFIGURATION}
              render={props => (
                <RuntimeConfiguration {...props} refetchVersion={refetch} />
              )}
            />
            <Route
              exact
              path={ROUTE.RUNTIME_VERSION_METRICS}
              render={props => (
                <RuntimeMetrics
                  {...props}
                  runtime={runtime}
                  version={version}
                />
              )}
            />
          </Switch>
        </div>
      </>
    );
  }

  // TODO use PageBase
  return (
    <>
      <Header>
        <Button label="ADD VERSION" height={40} to={newVersionRoute} />
      </Header>
      <div
        className={cx(styles.container, {
          [styles.viewWithLogs]: isUserInVersionStatus
        })}
        data-testid="runtimeContainer"
      >
        <NavigationBar />
        {getContent()}
      </div>
    </>
  );
}

export default Runtime;
