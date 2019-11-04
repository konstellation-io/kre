import React from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import Sidebar from '../../components/Sidebar/Sidebar';
import GeneralSettings from './GeneralSettings';
import SecuritySettings from './SecuritySettings';
import AuditSettings from './AuditSettings';
import { Route } from 'react-router';
import * as ROUTE from '../../constants/routes';
import { ICON } from '../.././icons';
import { History, Location } from 'history';
import styles from './Settings.module.scss';

type Props = {
  history: History;
  location: Location;
};
function Settings({ history, location }:Props) {
  const tabs = [
    {
      label: 'GENERAL',
      icon: ICON.BRANCH,
      route: ROUTE.SETTINGS_GENERAL
    },
    {
      label: 'SECURITY',
      icon: ICON.CHART,
      route: ROUTE.SETTINGS_SECURITY
    },
    {
      label: 'AUDIT',
      icon: ICON.USER,
      route: ROUTE.SETTINGS_AUDIT
    },
  ];

  return (
    <div className={styles.container} data-testid="settingsContainer">
      <NavigationBar />
      <Sidebar
        title='Settings'
        tabs={tabs}
        history={history}
        location={location}
      />
      <div className={styles.content}>
        <Route exact path={ROUTE.SETTINGS_GENERAL} component={GeneralSettings} />
        <Route exact path={ROUTE.SETTINGS_SECURITY} component={SecuritySettings} />
        <Route exact path={ROUTE.SETTINGS_AUDIT} component={AuditSettings} />
      </div>
    </div>
  );
}

export default Settings;
