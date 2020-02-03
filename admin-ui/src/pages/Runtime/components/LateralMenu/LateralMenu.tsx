import React from 'react';
import styles from './LateralMenu.module.scss';
import { Version, Runtime } from '../../../../graphql/models';
import RuntimeHexagon, {
  RuntimeHexagonSize
} from '../../../../components/RuntimeHexagon/RuntimeHexagon';
import NoVersionsPanel from './NoVersionsPanel';
import VersionInfo from './VersionInfo/VersionInfo';
import VersionMenu from './VersionMenu/VersionMenu';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom';
import ROUTE from '../../../../constants/routes';
import VersionActions from './VersionActions/VersionActions';

type LateralMenuProps = {
  runtime: Runtime;
  version: Version | undefined;
  versions: Version[];
};

function LateralMenu({ runtime, version, versions }: LateralMenuProps) {
  return (
    <div className={styles.wrapper}>
      <Link to={ROUTE.RUNTIME}>
        <div className={styles.runtimeNameSection}>
          <div className={styles.runtimeHexagon}>
            <RuntimeHexagon runtime={runtime} size={RuntimeHexagonSize.LARGE} />
          </div>
          <div className={styles.runtimeName}>{runtime.name}</div>
        </div>
        <div className={styles.backSection}>
          <IconArrowBack className="icon-regular" />
          <span>Back to versions</span>
        </div>
      </Link>
      {version && <VersionInfo version={version} />}
      {versions.length === 0 && <NoVersionsPanel runtime={runtime} />}
      {version && <VersionMenu runtime={runtime} version={version} />}
      {version && <VersionActions version={version} />}
    </div>
  );
}

export default LateralMenu;
