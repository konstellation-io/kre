import React, { useState, useEffect } from 'react';
import styles from './LateralMenu.module.scss';
import { Version, Runtime } from '../../../../graphql/models';
import RuntimeHexagon, {
  RuntimeHexagonSize
} from '../../../../components/RuntimeHexagon/RuntimeHexagon';
import NoVersionsPanel from './NoVersionsPanel';
import VersionListItem from './VersionListItem/VersionListItem';
import VersionDetailsPanel from './VersionDetailsPanel/VersionDetailsPanel';
import VersionList, { VersionListHeader } from './VersionList/VersionList';
import VersionMenu from './VersionMenu/VersionMenu';
import cx from 'classnames';
import Accordion from '../../../../components/Accordion/Accordion';

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
        <Accordion
          label={'VERSION OPENED'}
          customStyles={{ height: 'fit-content' }}
          subHeader={
            <VersionListItem
              version={version}
              selected={isVersionOpened}
              onSelect={setOpenedVersion}
            />
          }
        >
          <VersionMenu runtime={runtime} version={version} />
        </Accordion>
      )}
      {filteredVersions.length > 0 && (
        <Accordion
          label={version ? 'OTHER VERSIONS' : 'ALL VERSIONS'}
          subHeader={
            <VersionListHeader
              runtimeId={runtime.id}
              numVersions={filteredVersions.length}
            />
          }
        >
          <VersionList
            versions={filteredVersions}
            openedVersion={openedVersion}
            setOpenedVersion={v => setOpenedVersion(v)}
          />
        </Accordion>
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
