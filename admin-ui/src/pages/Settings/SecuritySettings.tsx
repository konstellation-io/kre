import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SettingsHeader from './components/SettingsHeader/SettingsHeader';
import AllowedDomains from './components/AllowedDomains/AllowedDomains';
import AllowedEmails from './components/AllowedEmails/AllowedEmails';

import cx from 'classnames';
import styles from './Settings.module.scss';

function SecuritySettings() {
  return (
    <>
      <div className={cx(styles.form, styles.securitySettings)}>
        <SettingsHeader>Security settings</SettingsHeader>
        <Tabs>
          <div className={styles.tabs}>
            <TabList>
              <Tab>Domains</Tab>
              <Tab>Emails</Tab>
            </TabList>
          </div>

          <TabPanel>
            <AllowedDomains />
          </TabPanel>
          <TabPanel>
            <AllowedEmails />
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
}

export default SecuritySettings;
