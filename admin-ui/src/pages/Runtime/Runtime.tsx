import React, { ReactElement } from 'react';
import { Route, Switch, useParams, useLocation } from 'react-router-dom';
import ROUTE, { VersionRouteParams } from '../../constants/routes';
import { buildRoute } from '../../utils/routes';

import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Button from '../../components/Button/Button';
import Version from '../Version/Version';

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  GetVersionConfStatus,
  GetVersionConfStatusVariables
} from '../../graphql/queries/types/GetVersionConfStatus';

import cx from 'classnames';
import styles from './Runtime.module.scss';
import RuntimeVersions from './pages/RuntimeVersions/RuntimeVersions';
import PageBase from '../../components/Layout/PageBase/PageBase';

const GetRuntimeAndVersionQuery = loader(
  '../../graphql/queries/getRuntimeAndVersions.graphql'
);

function Runtime() {
  const { runtimeId, versionId } = useParams<VersionRouteParams>();
  const location = useLocation();
  const { data, loading, error, refetch } = useQuery<
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
                  runtime={runtime}
                  refetch={refetch}
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

  const statusPath: string = buildRoute.version(
    ROUTE.RUNTIME_VERSION_STATUS,
    runtimeId,
    versionId
  );
  const isUserInVersionStatus: boolean = location.pathname === statusPath;

  return (
    <PageBase
      customClassname={cx({
        [styles.logsPadding]: isUserInVersionStatus
      })}
      headerChildren={
        isUserInRuntimeVersions ? (
          <Button label="ADD VERSION" height={40} to={newVersionRoute} />
        ) : null
      }
    >
      {getContent()}
    </PageBase>
  );
}

export default Runtime;
