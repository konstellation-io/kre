import React from 'react';
import styles from './VersionSideBar.module.scss';
import { Version, Runtime } from '../../../../graphql/models';
import RuntimeHexagon, {
  RuntimeHexagonSize
} from '../../../../components/RuntimeHexagon/RuntimeHexagon';
import VersionInfo from './VersionInfo/VersionInfo';
import VersionMenu from './VersionMenu/VersionMenu';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom';
import ROUTE from '../../../../constants/routes';
import VersionActions from './VersionActions/VersionActions';
import { buildRoute } from '../../../../utils/routes';

type VersionSideBarProps = {
  runtime: Runtime;
  version: Version;
};

function VersionSideBar({ runtime, version }: VersionSideBarProps) {
  return (
    <div className={styles.wrapper}>
      <Link to={buildRoute.runtime(ROUTE.RUNTIME, runtime.id)}>
        <div className={styles.backSection}>
          <IconArrowBack className="icon-regular" />
          <span>Back to versions</span>
        </div>
      </Link>
      <div className={styles.runtimeNameSection}>
        <div className={styles.runtimeHexagon}>
          <RuntimeHexagon runtime={runtime} size={RuntimeHexagonSize.LARGE} />
        </div>
        <div className={styles.runtimeName}>{runtime.name}</div>
      </div>
      <VersionInfo version={version} />

      <VersionMenu runtime={runtime} version={version} />
      <VersionActions runtime={runtime} version={version} />
    </div>
  );
}

export default VersionSideBar;
