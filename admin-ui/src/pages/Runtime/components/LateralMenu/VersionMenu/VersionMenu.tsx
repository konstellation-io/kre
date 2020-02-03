import React from 'react';
import styles from './VersionMenu.module.scss';
import { Version, Runtime } from '../../../../../graphql/models';
import VersionMenuItem, { VersionMenuItemProps } from './VersionMenuItem';
import ROUTE from '../../../../../constants/routes';
import IconDeviceHub from '@material-ui/icons/DeviceHub';
import IconShowChart from '@material-ui/icons/ShowChart';
import IconSettings from '@material-ui/icons/Settings';

type VersionDetailsProps = {
  runtime: Runtime;
  version: Version;
};

function VersionMenu({ runtime, version }: VersionDetailsProps) {
  const itemProps: VersionMenuItemProps[] = [
    {
      label: 'STATUS',
      to: ROUTE.RUNTIME_VERSION_STATUS,
      exact: false,
      Icon: IconDeviceHub
    },
    {
      label: 'METRICS',
      to: ROUTE.RUNTIME_VERSION_METRICS,
      Icon: IconShowChart
    },
    {
      label: 'CONFIGURATION',
      to: ROUTE.RUNTIME_VERSION_CONFIGURATION,
      Icon: IconSettings,
      warning: version.configurationCompleted
        ? ''
        : 'Configuration is not completed'
    }
  ];

  itemProps.forEach(p => {
    p.to = p.to
      .replace(':runtimeId', runtime.id)
      .replace(':versionId', version.id);
  });

  const items = itemProps.map((props, idx) => (
    <VersionMenuItem key={idx} {...props} />
  ));

  return <div className={styles.wrapper}>{items}</div>;
}

export default VersionMenu;
