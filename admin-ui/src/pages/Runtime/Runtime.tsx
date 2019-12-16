import React from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import * as ROUTE from '../../constants/routes';

import StatusIcon from '@material-ui/icons/DeviceHub';
import MetricsIcon from '@material-ui/icons/ShowChart';
import DocumentationIcon from '@material-ui/icons/Toc';
import TimeIcon from '@material-ui/icons/AccessTime';
import ConfigIcon from '@material-ui/icons/Settings';

import RuntimeStatus from './pages/RuntimeStatus/RuntimeStatus';
import RuntimeStatusPreview from './pages/RuntimeStatusPreview/RuntimeStatusPreview';
import RuntimeVersions from './pages/RuntimeVersions/RuntimeVersions';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import Button from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';
import SidebarTitle from './components/SidebarTitle/SidebarTitle';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_RUNTIME,
  GetRuntimeResponse,
  GetRuntimeVars
} from './Runtime.graphql';

import styles from './Runtime.module.scss';

function createNavTabs(runtimeId: string) {
  const navTabs = [
    {
      label: 'STATUS',
      route: ROUTE.RUNTIME_STATUS,
      Icon: StatusIcon,
      exact: false
    },
    {
      label: 'METRICS',
      route: ROUTE.HOME,
      Icon: MetricsIcon
    },
    {
      label: 'DOCUMENTATION',
      route: ROUTE.HOME,
      Icon: DocumentationIcon
    },
    {
      label: 'VERSIONS',
      route: ROUTE.RUNTIME_VERSIONS,
      Icon: TimeIcon
    },
    {
      label: 'CONFIGURATION',
      route: ROUTE.HOME,
      Icon: ConfigIcon
    }
  ];

  navTabs.forEach(n => {
    n.route = n.route.replace(':runtimeId', runtimeId);
  });

  return navTabs;
}

function Runtime() {
  const { runtimeId } = useParams();
  const { data, loading, error } = useQuery<GetRuntimeResponse, GetRuntimeVars>(
    GET_RUNTIME,
    {
      variables: { runtimeId },
      fetchPolicy: 'no-cache'
    }
  );

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  const activeVersion = data && {
    versionNumber: data.runtime.versions[0].versionNumber,
    created: data.runtime.versions[0].creationDate,
    activated: data.runtime.versions[0].activationDate,
    status: 'active',
    title: data.runtime.name
  };

  const navTabs = createNavTabs(runtimeId || '');
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
        <Sidebar
          title="Runtime"
          subheader={<SidebarTitle version={activeVersion} />}
          tabs={navTabs}
        />
        <div className={styles.content}>
          <Switch>
            <Route
              exact
              path={ROUTE.RUNTIME_STATUS_PREVIEW}
              component={RuntimeStatusPreview}
            />
            <Route
              exact
              path={ROUTE.RUNTIME_STATUS}
              component={RuntimeStatus}
            />
            <Route
              exact
              path={ROUTE.RUNTIME_VERSIONS}
              component={RuntimeVersions}
            />
          </Switch>
          {/*<Route exact path={ROUTE.SETTINGS_SECURITY} component={SecuritySettings} />
          <Route exact path={ROUTE.SETTINGS_AUDIT} component={AuditSettings} /> */}
        </div>
      </div>
    </>
  );
}

export default Runtime;
