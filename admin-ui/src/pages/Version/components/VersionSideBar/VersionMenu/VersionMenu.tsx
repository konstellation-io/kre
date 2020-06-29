import React from 'react';
import styles from './VersionMenu.module.scss';
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from '../../../../../graphql/queries/types/GetVersionConfStatus';
import VersionMenuItem, { VersionMenuItemProps } from './VersionMenuItem';
import ROUTE from '../../../../../constants/routes';
import IconDeviceHub from '@material-ui/icons/DeviceHub';
import IconDoc from '@material-ui/icons/Toc';
import IconShowChart from '@material-ui/icons/ShowChart';
import IconSettings from '@material-ui/icons/Settings';
import { buildRoute } from '../../../../../utils/routes';
import useUserAccess from '../../../../../hooks/useUserAccess';
import { checkPermission } from '../../../../../rbac-rules';

type VersionDetailsProps = {
  runtime: GetVersionConfStatus_runtime;
  version: GetVersionConfStatus_versions;
};

function VersionMenu({ runtime, version }: VersionDetailsProps) {
  const { accessLevel } = useUserAccess();

  const itemProps: VersionMenuItemProps[] = [
    {
      label: 'STATUS',
      to: ROUTE.RUNTIME_VERSION_STATUS,
      exact: false,
      Icon: IconDeviceHub
    },
    {
      label: 'DOCUMENTATION',
      to: ROUTE.RUNTIME_VERSION_DOCUMENTATION,
      exact: false,
      Icon: IconDoc
    },
    {
      label: 'METRICS',
      to: ROUTE.RUNTIME_VERSION_METRICS,
      Icon: IconShowChart
    }
  ];

  if (checkPermission(accessLevel, 'version:edit')) {
    itemProps.push({
      label: 'CONFIGURATION',
      to: ROUTE.RUNTIME_VERSION_CONFIGURATION,
      Icon: IconSettings,
      warning: version.config.completed ? '' : 'Configuration is not completed'
    });
  }

  itemProps.forEach(p => {
    p.to = buildRoute.version(p.to, runtime.id, version.id);
  });

  const items = itemProps.map(props => (
    <VersionMenuItem key={`${props.label}-${props.to}`} {...props} />
  ));

  return <div className={styles.wrapper}>{items}</div>;
}

export default VersionMenu;
