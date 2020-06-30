import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';
import RuntimeHexagon, {
  RuntimeHexagonSize
} from 'Components/RuntimeHexagon/RuntimeHexagon';

import Can from 'Components/Can/Can';
import IconArrowBack from '@material-ui/icons/KeyboardBackspace';
import { Link } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import React from 'react';
import VersionActions from './VersionActions/VersionActions';
import VersionInfo from './VersionInfo/VersionInfo';
import VersionMenu from './VersionMenu/VersionMenu';
import { buildRoute } from 'Utils/routes';
import styles from './VersionSideBar.module.scss';

type VersionSideBarProps = {
  runtime?: GetVersionConfStatus_runtime;
  version?: GetVersionConfStatus_versions;
};

function VersionSideBar({ runtime, version }: VersionSideBarProps) {
  if (runtime === undefined || version === undefined) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Link to={buildRoute.runtime(ROUTE.RUNTIME, runtime.id)}>
        <div className={styles.backSection}>
          <IconArrowBack className="icon-regular" />
          <div className={styles.runtimeHexagon}>
            <RuntimeHexagon runtime={runtime} size={RuntimeHexagonSize.SMALL} />
          </div>
          <div className={styles.runtimeName}>{runtime.name}</div>
        </div>
      </Link>
      <div className={styles.runtimeNameSection}></div>
      <VersionInfo version={version} />
      <VersionMenu runtime={runtime} version={version} />
      <Can perform="version:edit">
        <VersionActions runtime={runtime} version={version} />
      </Can>
    </div>
  );
}

export default VersionSideBar;
