import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';

import BackButton from './BackButton/BackButton';
import Can from 'Components/Can/Can';
import React from 'react';
import RuntimeMenu from './RuntimeMenu/RuntimeMenu';
import VersionActions from './VersionActions/VersionActions';
import VersionInfo from './VersionInfo/VersionInfo';
import VersionMenu from './VersionMenu/VersionMenu';
import styles from './VersionSideBar.module.scss';

type VersionSideBarProps = {
  runtime?: GetVersionConfStatus_runtime;
  versions?: GetVersionConfStatus_versions[];
  version?: GetVersionConfStatus_versions;
};

function VersionSideBar({ runtime, versions, version }: VersionSideBarProps) {
  if (
    runtime === undefined ||
    version === undefined ||
    versions === undefined
  ) {
    return null;
  }

  return (
    <div className={styles.wrapper} data-testid="versionSidebar">
      <BackButton runtime={runtime} />
      <RuntimeMenu runtime={runtime} />
      <VersionInfo version={version} />
      <VersionMenu runtime={runtime} version={version} />
      <Can perform="version:edit">
        <VersionActions versions={versions} version={version} />
      </Can>
    </div>
  );
}

export default VersionSideBar;
