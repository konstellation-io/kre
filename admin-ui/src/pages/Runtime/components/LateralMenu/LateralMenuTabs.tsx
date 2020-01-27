import React, { useState, useEffect } from 'react';
import { Tabs, TabPanel, TabList, Tab } from 'react-tabs';
import { Runtime, Version } from '../../../../graphql/models';
import VersionDetailsPanel from './VersionDetailsPanel';
import VersionList from './VersionList/VersionList';
import VersionMenu from './VersionMenu/VersionMenu';

type LateralMenuTabsProps = {
  runtime: Runtime;
  version: Version | undefined;
  versions: Version[];
};

function LateralMenuTabs({ runtime, version, versions }: LateralMenuTabsProps) {
  const [detailsVersion, setDetailsVersion] = useState<Version | undefined>(
    undefined
  );

  useEffect(() => {
    if (detailsVersion !== undefined) {
      // This will update de version details panel if the apollo cache is refreshed
      const newDetailsVersion = versions.find(v => v.id === detailsVersion.id);
      if (
        newDetailsVersion &&
        newDetailsVersion.status !== detailsVersion.status
      ) {
        setDetailsVersion(newDetailsVersion);
      }
    }
  }, [versions, detailsVersion, setDetailsVersion]);

  const isVersionOpened =
    version && detailsVersion && detailsVersion.id === version.id;

  const noVersionSelected = version === undefined;
  const [tabIdx, setTabIdx] = useState<number>(noVersionSelected ? 1 : 0);

  function onTabSelect(index: number, lastIndex: number, event: Event) {
    setTabIdx(index);
  }

  function selectDetailsTab() {
    setTabIdx(0);
  }

  return (
    <>
      <Tabs selectedIndex={tabIdx} onSelect={onTabSelect}>
        <TabList>
          <Tab disabled={noVersionSelected}>DETAILS</Tab>
          <Tab>VERSIONS</Tab>
        </TabList>

        <TabPanel>
          {version && (
            <VersionMenu
              runtime={runtime}
              version={version}
              setDetailsVersion={v => setDetailsVersion(v)}
            />
          )}
        </TabPanel>

        <TabPanel>
          <VersionList
            versions={versions}
            detailsVersion={detailsVersion}
            setDetailsVersion={v => setDetailsVersion(v)}
          />
        </TabPanel>
      </Tabs>
      {detailsVersion && (
        <VersionDetailsPanel
          runtime={runtime}
          version={detailsVersion}
          isVersionOpened={isVersionOpened}
          setDetailsVersion={setDetailsVersion}
          selectDetailsTab={selectDetailsTab}
        />
      )}
    </>
  );
}

export default LateralMenuTabs;
