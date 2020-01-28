import React, { useState, useEffect } from 'react';
import styles from './LateralMenu.module.scss';
import { Version, Runtime } from '../../../../graphql/models';
import RuntimeHexagon, {
  RuntimeHexagonSize
} from '../../../../components/RuntimeHexagon/RuntimeHexagon';
import NoVersionsPanel from './NoVersionsPanel';
import VersionListItem from './VersionListItem/VersionListItem';
import VersionDetailsPanel from './VersionDetailsPanel/VersionDetailsPanel';
import VersionList from './VersionList/VersionList';
import VersionMenu from './VersionMenu/VersionMenu';
import cx from 'classnames';

type LateralMenuProps = {
  runtime: Runtime;
  version: Version | undefined;
  versions: Version[];
};

function LateralMenu({ runtime, version, versions }: LateralMenuProps) {
  const [openedVersion, setOpenedVersion] = useState<Version | undefined>(
    undefined
  );

  const isVersionOpened: boolean = Boolean(
    version && openedVersion && openedVersion.id === version.id
  );

  // This will update de version details panel if the apollo cache is refreshed
  useEffect(() => {
    if (openedVersion !== undefined) {
      const newOpenedVersion = versions.find(v => v.id === openedVersion.id);
      if (
        newOpenedVersion &&
        newOpenedVersion.status !== openedVersion.status
      ) {
        setOpenedVersion(newOpenedVersion);
      }
    }
  }, [versions, openedVersion, setOpenedVersion]);

  function closeVersionDetailsPanel() {
    setOpenedVersion(undefined);
  }

  const filteredVersions = version
    ? versions.filter(v => v.id !== version.id)
    : versions;

  return (
    <div className={styles.wrapper}>
      <div className={styles.runtimeNameSection}>
        <div className={styles.runtimeHexagon}>
          <RuntimeHexagon runtime={runtime} size={RuntimeHexagonSize.LARGE} />
        </div>
        <div className={styles.runtimeName}>{runtime.name}</div>
      </div>
      {versions.length === 0 && <NoVersionsPanel runtime={runtime} />}
      {version && (
        <>
          <div>
            <VersionListItem
              version={version}
              selected={isVersionOpened}
              onSelect={setOpenedVersion}
            />
          </div>
          <VersionMenu runtime={runtime} version={version} />
        </>
      )}
      {filteredVersions.length > 0 && (
        <VersionList
          label={version ? 'OTHER VERSIONS' : 'ALL VERSIONS'}
          versions={filteredVersions}
          openedVersion={openedVersion}
          setOpenedVersion={v => setOpenedVersion(v)}
        />
      )}
      <div
        className={cx(styles.lateralPanel, { [styles.opened]: openedVersion })}
      >
        {openedVersion && (
          <>
            <div
              className={styles.shield}
              onClick={closeVersionDetailsPanel}
            ></div>
            <VersionDetailsPanel
              runtime={runtime}
              version={openedVersion}
              isVersionOpened={isVersionOpened}
              setOpenedVersion={setOpenedVersion}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default LateralMenu;
