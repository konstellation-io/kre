import React from 'react';
import styles from './VersionMenu.module.scss';
import { Version, Runtime } from '../../../../../graphql/models';
import VersionMenuItem, { VersionMenuItemProps } from './VersionMenuItem';
import {
  RUNTIME_VERSION_STATUS,
  RUNTIME_VERSION_METRICS,
  RUNTIME_VERSION_CONFIGURATION
} from '../../../../../constants/routes';

type VersionDetailsProps = {
  runtime: Runtime;
  version: Version;
};

function VersionMenu({ runtime, version }: VersionDetailsProps) {
  const itemProps: VersionMenuItemProps[] = [
    {
      label: 'STATUS',
      to: RUNTIME_VERSION_STATUS,
      exact: false
    },
    {
      label: 'METRICS',
      to: RUNTIME_VERSION_METRICS
    },
    {
      label: 'CONFIGURATION',
      to: RUNTIME_VERSION_CONFIGURATION,
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
