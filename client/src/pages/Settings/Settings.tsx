import React, {useState} from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import Sidebar from '../../components/Sidebar/Sidebar';
import GeneralSettings from './GeneralSettings';
import SecuritySettings from './SecuritySettings';
import AuditSettings from './AuditSettings';
import { ICON } from '../.././icons';
import styles from './Settings.module.scss';

type Props = {
  history?: any;
};
function Settings({ history }:Props = {}) {
  const [activeSetting, setActiveSetting] = useState(0);

  const settings = [
    {
      label: 'GENERAL',
      icon: ICON.BRANCH,
      content: <GeneralSettings />
    },
    {
      label: 'SECURITY',
      icon: ICON.CHART,
      content: <SecuritySettings />
    },
    {
      label: 'AUDIT',
      icon: ICON.USER,
      content: <AuditSettings />
    },
  ];
  const tabs = settings.map(setting => ({label: setting.label, icon: setting.icon}));

  return (
    <div className={styles.container} data-testid="settingsContainer">
      <NavigationBar />
      <Sidebar
        title='Settings'
        onChange={(idx:number) => setActiveSetting(idx)}
        tabs={tabs}
        history={history}
      />
      <div className={styles.content}>
        { settings[activeSetting].content }
      </div>
    </div>
  );
}

export default Settings;
