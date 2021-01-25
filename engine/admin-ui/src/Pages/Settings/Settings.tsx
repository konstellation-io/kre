import GeneralIcon from '@material-ui/icons/DeviceHub';
import GeneralSettings from './GeneralSettings';
import PageBase from 'Components/Layout/PageBase/PageBase';
import ROUTE from 'Constants/routes';
import React from 'react';
import { Route } from 'react-router';
import SecurityIcon from '@material-ui/icons/Security';
import SecuritySettings from './SecuritySettings';
import Sidebar from 'Components/Sidebar/Sidebar';
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
  }
];

function Settings() {
  return (
    <PageBase>
      <div className={styles.container} data-testid="settingsContainer">
        <Sidebar title="Settings" tabs={tabs} />
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
        </div>
      </div>
    </PageBase>
  );
}

export default Settings;
