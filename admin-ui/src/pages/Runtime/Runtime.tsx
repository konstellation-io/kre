import React from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import * as ROUTE from '../../constants/routes';

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

import styles from './Runtime.module.scss';

function Runtime() {
  const { runtimeId, versionId } = useParams();
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

  return (
    <>
      <Header>
        <Button label="ADD VERSION" height={40} to={newVersionRoute} />
      </Header>
      <div className={styles.container} data-testid="runtimeContainer">
        <NavigationBar />
        <LateralMenu runtime={runtime} versions={versions} version={version} />
        <div className={styles.content}>
          <Switch>
            <Route
              exact
              path={ROUTE.RUNTIME_VERSION_STATUS}
              component={RuntimeStatusPreview}
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
