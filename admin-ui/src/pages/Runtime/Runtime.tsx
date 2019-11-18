import React from 'react';
import { Route, useParams } from 'react-router-dom';
import { History, Location } from 'history';
import * as ROUTE from '../../constants/routes';

import StatusIcon from '@material-ui/icons/DeviceHub';
import MetricsIcon from '@material-ui/icons/ShowChart';
import DocumentationIcon from '@material-ui/icons/Toc';
import TimeIcon from '@material-ui/icons/AccessTime';
import ConfigIcon from '@material-ui/icons/Settings';

import RuntimeStatus from './pages/RuntimeStatus/RuntimeStatus';
import RuntimeVersions from './pages/RuntimeVersions/RuntimeVersions';
import Header from '../../components/Header/Header';
import Spinner from '../../components/Spinner/Spinner';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import Button from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';
import SidebarTitle from './components/SidebarTitle/SidebarTitle';

import { useQuery } from '@apollo/react-hooks';
import { GET_RUNTIME, formatSidebarData } from './dataModels';

import styles from './Runtime.module.scss';

const tabs = [
  {
    label: 'STATUS',
    route: ROUTE.RUNTIME_STATUS,
    Icon: StatusIcon
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
    label: 'VERSION',
    route: ROUTE.HOME,
    Icon: TimeIcon
  },
  {
    label: 'CONFIGURATION',
    route: ROUTE.HOME,
    Icon: ConfigIcon
  }
];

type Props = {
  history: History;
  location: Location;
};
function Runtime({ history, location }: Props) {
  const { runtimeId } = useParams();
  const { data, loading, error } = useQuery(GET_RUNTIME, {
    variables: { runtimeId }
  });

  if (error) return <p>ERROR</p>;
  if (loading) return <Spinner />;

  const sidebarData = formatSidebarData(data.runtime);

  return (
    <>
      <Header>
        <Button label="ADD VERSION" height={40} />
      </Header>
      <div className={styles.container} data-testid="runtimeContainer">
        <NavigationBar />
        <Sidebar
          title="Runtime"
          subheader={<SidebarTitle {...sidebarData} />}
          tabs={tabs}
          history={history}
          location={location}
        />
        <div className={styles.content}>
          <Route exact path={ROUTE.RUNTIME_STATUS} component={RuntimeStatus} />
          <Route
            exact
            path={ROUTE.RUNTIME_VERSIONS}
            component={RuntimeVersions}
          />
          {/*<Route exact path={ROUTE.SETTINGS_SECURITY} component={SecuritySettings} />
          <Route exact path={ROUTE.SETTINGS_AUDIT} component={AuditSettings} /> */}
        </div>
      </div>
    </>
  );
}

export default Runtime;
