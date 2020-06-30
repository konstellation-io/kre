import React from 'react';
import SettingsHeader from './components/SettingsHeader/SettingsHeader';
import AllowedDomains from './components/AllowedDomains/AllowedDomains';

import cx from 'classnames';
import styles from './Settings.module.scss';

function SecuritySettings() {
  return (
    <>
      <div className={cx(styles.form, styles.securitySettings)}>
        <SettingsHeader>Security settings</SettingsHeader>
        <AllowedDomains />
      </div>
    </>
  );
}

export default SecuritySettings;
