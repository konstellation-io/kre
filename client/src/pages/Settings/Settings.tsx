import React from 'react';
import { Route } from 'react-router';
import { History, Location } from 'history';
import { ICON } from '../.././icons';
import * as ROUTE from '../../constants/routes';

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
    </>
  );
}

export default Settings;
