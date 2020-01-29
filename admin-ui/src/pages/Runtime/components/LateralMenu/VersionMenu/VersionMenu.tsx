import React from 'react';
import NavBar, {
  Tab as NavBarTab,
  ItemSize
} from '../../../../../components/NavBar/NavBar';
import * as ROUTE from '../../../../../constants/routes';
import styles from './VersionMenu.module.scss';
import { Version, Runtime } from '../../../../../graphql/models';

type VersionDetailsProps = {
  runtime: Runtime;
  version: Version;
};

function VersionMenu({ runtime, version }: VersionDetailsProps) {
  let navTabs: NavBarTab[] = createNavTabs(
    runtime.id || '',
    (version && version.id) || ''
  );

  if (version && version.configurationCompleted === false) {
    navTabs = addWarningToTab(
      'CONFIGURATION',
      navTabs,
      'Configuration is not completed'
    );
  }

  return (
    <div className={styles.wrapper}>
      <NavBar tabs={navTabs} itemSize={ItemSize.SMALL} showItemArrows={true} />
    </div>
  );
}

function addWarningToTab(
  label: string,
  tabs: NavBarTab[],
  message: string
): NavBarTab[] {
  return updateTab(label, tabs, function(tab: NavBarTab) {
    tab.showWarning = true;
    tab.warningTitle = message;
  });
}

function updateTab(
  label: string,
  tabs: NavBarTab[],
  updateFunc: (t: NavBarTab) => void
): NavBarTab[] {
  return tabs.map((tab: NavBarTab) => {
    let tabCp = { ...tab };

    if (tab.label === label) {
      updateFunc(tabCp);
    }

    return tabCp;
  });
}

function createNavTabs(runtimeId: string, versionId: string): NavBarTab[] {
  const navTabs = [
    {
      label: 'STATUS',
      route: ROUTE.RUNTIME_VERSION_STATUS,
      exact: false
    },
    {
      label: 'METRICS',
      route: ROUTE.RUNTIME_VERSION_METRICS
    },
    {
      label: 'CONFIGURATION',
      route: ROUTE.RUNTIME_VERSION_CONFIGURATION
    }
  ];

  navTabs.forEach(n => {
    n.route = n.route
      .replace(':runtimeId', runtimeId)
      .replace(':versionId', versionId);
  });

  return navTabs;
}

export default VersionMenu;
