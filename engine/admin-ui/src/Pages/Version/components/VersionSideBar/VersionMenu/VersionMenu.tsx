import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';
import VersionMenuItem, { VersionMenuItemProps } from './VersionMenuItem';

import IconDeviceHub from '@material-ui/icons/DeviceHub';
import IconDoc from '@material-ui/icons/Toc';
import IconSettings from '@material-ui/icons/Settings';
import IconShowChart from '@material-ui/icons/ShowChart';
import ROUTE from 'Constants/routes';
import React from 'react';
import { buildRoute } from 'Utils/routes';
import { checkPermission } from 'rbac-rules';
import styles from './VersionMenu.module.scss';
import useUserAccess from 'Hooks/useUserAccess';

type VersionDetailsProps = {
  runtime: GetVersionConfStatus_runtime;
  version: GetVersionConfStatus_versions;
};

function VersionMenu({ runtime, version }: VersionDetailsProps) {
  const { accessLevel } = useUserAccess();

  const itemProps: VersionMenuItemProps[] = [
    {
      label: 'STATUS',
      to: ROUTE.VERSION_STATUS,
      exact: false,
      Icon: IconDeviceHub
    }
  ];

  if (version.hasDoc) {
    itemProps.push({
      label: 'DOCUMENTATION',
      to: ROUTE.VERSION_DOCUMENTATION,
      exact: false,
      Icon: IconDoc
    });
  }

  itemProps.push({
    label: 'PREDICTIONS',
    to: ROUTE.VERSION_METRICS,
    Icon: IconShowChart
  });

  if (checkPermission(accessLevel, 'version:edit')) {
    itemProps.push({
      label: 'CONFIGURATION',
      to: ROUTE.VERSION_CONFIGURATION,
      Icon: IconSettings,
      warning: version.config.completed ? '' : 'Configuration is not completed'
    });
  }

  itemProps.forEach(p => {
    p.to = buildRoute(p.to, version.id);
  });

  const items = itemProps.map(props => (
    <VersionMenuItem key={`${props.label}-${props.to}`} {...props} />
  ));

  return <div className={styles.wrapper}>{items}</div>;
}

export default VersionMenu;
