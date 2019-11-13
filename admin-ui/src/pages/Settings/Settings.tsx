import React from 'react';
import { Route } from 'react-router';
import { History, Location } from 'history';
import * as ROUTE from '../../constants/routes';

import GeneralIcon from '@material-ui/icons/DeviceHub';
import SecurityIcon from '@material-ui/icons/Security';
import UsersIcon from '@material-ui/icons/SupervisorAccount';

import GeneralSettings from './GeneralSettings';
import SecuritySettings from './SecuritySettings';
import AuditSettings from './AuditSettings';
import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import Sidebar from '../../components/Sidebar/Sidebar';

import styles from './Settings.module.scss';

const tabs = [
  {
    label: 'GENERAL',
    route: ROUTE.SETTINGS_GENERAL,
    Icon: GeneralIcon
  },
  {
    label: 'SECURITY',
    route: ROUTE.SETTINGS_SECURITY,
    Icon: SecurityIcon
  },
  {
    label: 'AUDIT',
    route: ROUTE.SETTINGS_AUDIT,
    Icon: UsersIcon
  }
];

type Props = {
  history: History;
  location: Location;
};
function Settings({ history, location }: Props) {
  return (
    <>
      <Header />
      <div className={styles.container} data-testid="settingsContainer">
        <NavigationBar />
        <Sidebar
          title="Settings"
          subtitle="Fusce vehicula dolor arcu, sit amet."
          tabs={tabs}
          history={history}
          location={location}
        />
        <div className={styles.content}>
          <Route
            exact
            path={ROUTE.SETTINGS_GENERAL}
            component={GeneralSettings}
          />
          <Route
            exact
            path={ROUTE.SETTINGS_SECURITY}
            component={SecuritySettings}
          />
          <Route exact path={ROUTE.SETTINGS_AUDIT} component={AuditSettings} />
        </div>
      </div>
    </>
  );
}

export default Settings;
