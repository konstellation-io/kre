import React from 'react';
import { Route, Switch, useParams, useLocation } from 'react-router-dom';
import * as ROUTE from '../../constants/routes';
import { buildRoute } from '../../utils/routes';

import RuntimeStatusPreview from './pages/RuntimeStatusPreview/RuntimeStatusPreview';
import RuntimeConfiguration from './pages/RuntimeConfiguration/RuntimeConfiguration';
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

function Runtime() {
  const { runtimeId, versionId } = useParams();
  const location = useLocation();
  const { data, loading, error, refetch } = useQuery<
    GetRuntimeAndVersionsResponse,
    GetRuntimeAndVersionsVars
  >(GET_RUNTIME_AND_VERSIONS, {
    variables: { runtimeId }
  });

  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;
  if (!data) return null;

  const runtime = data.runtime;
  const versions = data.versions;
  const version = versions.find(v => v.id === versionId);
  const newVersionRoute = ROUTE.NEW_VERSION.replace(
    ':runtimeId',
    runtimeId || ''
  );

  const statusPath: string = buildRoute.version(
    ROUTE.RUNTIME_VERSION_STATUS,
    runtimeId,
    versionId
  );
  const isUserInVersionStatus: boolean = location.pathname === statusPath;

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
        <LateralMenu runtime={runtime} versions={versions} version={version} />
        <div className={styles.content}>
          <Switch>
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
          </Switch>
        </div>
      </div>
    </>
  );
}

export default Runtime;
