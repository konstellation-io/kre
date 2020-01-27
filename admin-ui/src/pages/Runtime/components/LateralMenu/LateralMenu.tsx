import React from 'react';
import styles from './LateralMenu.module.scss';
import { Version, Runtime } from '../../../../graphql/models';
import RuntimeHexagon, {
  RuntimeHexagonSize
} from '../../../../components/RuntimeHexagon/RuntimeHexagon';
import NoVersionsPanel from './NoVersionsPanel';
import LateralMenuTabs from './LateralMenuTabs';

type LateralMenuProps = {
  runtime: Runtime;
  version: Version | undefined;
  versions: Version[];
};

function LateralMenu({ runtime, version, versions }: LateralMenuProps) {
  const content =
    versions.length > 0 ? (
      <LateralMenuTabs
        runtime={runtime}
        version={version}
        versions={versions}
      />
    ) : (
      <NoVersionsPanel runtime={runtime} />
    );

  return (
    <div className={styles.wrapper}>
      <div className={styles.runtimeNameSection}>
        <div className={styles.runtimeHexagon}>
          <RuntimeHexagon runtime={runtime} size={RuntimeHexagonSize.LARGE} />
        </div>
        <div className={styles.runtimeName}>{runtime.name}</div>
      </div>
      {content}
    </div>
  );
}

export default LateralMenu;
