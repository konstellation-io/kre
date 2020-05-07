import React from 'react';
import styles from './VersionSideBar.module.scss';
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from '../../../../graphql/queries/types/GetVersionConfStatus';
import RuntimeHexagon, {
  RuntimeHexagonSize
} from '../../../../components/RuntimeHexagon/RuntimeHexagon';
import VersionInfo from './VersionInfo/VersionInfo';
import VersionMenu from './VersionMenu/VersionMenu';
import IconArrowBack from '@material-ui/icons/KeyboardBackspace';
import { Link } from 'react-router-dom';
import ROUTE from '../../../../constants/routes';
import VersionActions from './VersionActions/VersionActions';
import { buildRoute } from '../../../../utils/routes';
import Can from '../../../../components/Can/Can';

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
      <Can access>
        <VersionActions runtime={runtime} version={version} />
      </Can>
    </div>
  );
}

export default VersionSideBar;
