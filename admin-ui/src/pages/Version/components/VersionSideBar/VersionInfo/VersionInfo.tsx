import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from '../../../../../graphql/queries/types/GetVersionConfStatus';

import Can from '../../../../../components/Can/Can';
import React from 'react';
import StatusCircle from '../../../../../components/StatusCircle/StatusCircle';
import VersionActions from '../VersionActions/VersionActions';
import cx from 'classnames';
import styles from './VersionInfo.module.scss';

type VersionListItemProps = {
  version: GetVersionConfStatus_versions;
  runtime: GetVersionConfStatus_runtime;
};

function VersionInfo({ runtime, version }: VersionListItemProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.name}>
        <div>{version.name}</div>
        <Can perform="version:edit">
          <VersionActions runtime={runtime} version={version} quickActions />
        </Can>
      </div>
      <div className={styles.labelContainer}>
        <StatusCircle status={version.status} />
        <div className={cx(styles.label, styles[version.status])}>
          {version.status}
        </div>
      </div>

      <div>
        <div className={styles.desc}>{version.description}</div>
      </div>
    </div>
  );
}

export default VersionInfo;
