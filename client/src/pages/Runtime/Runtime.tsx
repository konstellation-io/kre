import React from 'react';
import { History, Location } from 'history';
import * as ROUTE from '../../constants/routes';

import StatusIcon from '@material-ui/icons/DeviceHub';
import MetricsIcon from '@material-ui/icons/ShowChart';
import DocumentationIcon from '@material-ui/icons/Toc';
import TimeIcon from '@material-ui/icons/AccessTime';
import ConfigIcon from '@material-ui/icons/Settings';

import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import Button from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';

import styles from './Runtime.module.scss';

const tabs = [
  {
    label: 'STATUS',
    route: ROUTE.HOME,
    Icon: StatusIcon
  },
  {
    label: 'METRICS',
    route: ROUTE.HOME,
    Icon: MetricsIcon,
  },
  {
    label: 'DOCUMENTATION',
    route: ROUTE.HOME,
    Icon: DocumentationIcon,
  },
  {
    label: 'VERSION',
    route: ROUTE.HOME,
    Icon: TimeIcon,
  },
  {
    label: 'CONFIGURATION',
    route: ROUTE.HOME,
    Icon: ConfigIcon,
  },
];

type Props = {
  history: History;
  location: Location;
};
function Runtime({ history, location }: Props) {
  return (
    <>
      <Header>
        <Button
          label='ADD VERSION'
          height={40}
        />
      </Header>
      <div className={styles.container} data-testid="runtimeContainer">
        <NavigationBar />
        <Sidebar
          title='Runtime'
          tabs={tabs}
          history={history}
          location={location}
        />
        <div className={styles.content}>
          {/* <Route exact path={ROUTE.SETTINGS_GENERAL} component={GeneralSettings} />
          <Route exact path={ROUTE.SETTINGS_SECURITY} component={SecuritySettings} />
          <Route exact path={ROUTE.SETTINGS_AUDIT} component={AuditSettings} /> */}
        </div>
      </div>
    </>
  );
}

export default Runtime;
