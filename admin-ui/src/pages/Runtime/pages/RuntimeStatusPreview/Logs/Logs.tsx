import React, { useState, useEffect } from 'react';

import Header from './components/Header/Header';
import Filters from './components/Filters/Filters';
import LogsList from './components/LogsList/LogsList';

import cx from 'classnames';
import styles from './Logs.module.scss';

type Props = {
  nodeId?: string;
  runtimeName: string;
  versionName: string;
  setSelectedNode: Function;
};
function Logs({ nodeId, runtimeName, versionName, setSelectedNode }: Props) {
  const [opened, setOpened] = useState<boolean>(false);

  useEffect(() => {
    setOpened(nodeId !== undefined);
  }, [nodeId]);

  function closeLogs() {
    setSelectedNode(undefined);
  }

  return (
    <>
      <div className={cx(styles.container, { [styles.opened]: opened })}>
        <Header
          runtimeName={runtimeName}
          versionName={versionName}
          closeLogs={closeLogs}
          opened={opened}
        />
        <div className={styles.content}>
          {nodeId && (
            <>
              <Filters filters={{ node_id: nodeId }} />
              <LogsList nodeId={nodeId} />
            </>
          )}
        </div>
      </div>
      <div
        className={cx(styles.shield, { [styles.show]: opened })}
        onClick={closeLogs}
      />
    </>
  );
}

export default Logs;
