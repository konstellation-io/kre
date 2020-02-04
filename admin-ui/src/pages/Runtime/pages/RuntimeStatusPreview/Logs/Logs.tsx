import React, { useState, useEffect } from 'react';

import Header from './components/Header/Header';
import Filters from './components/Filters/Filters';
import LogsList from './components/LogsList/LogsList';
import { Node } from '../RuntimeStatusPreview';

import cx from 'classnames';
import styles from './Logs.module.scss';

type Props = {
  node?: Node;
  setSelectedNode: Function;
};
function Logs({ node, setSelectedNode }: Props) {
  const [opened, setOpened] = useState<boolean>(false);
  const [stickToBottom, setStickToBottom] = useState<boolean>(false);

  useEffect(() => {
    setOpened(node !== undefined);
  }, [node]);

  function closeLogs() {
    setSelectedNode(undefined);
  }

  function scrollToBottom() {
    const listContainer = document.getElementById('VersionLogsListContainer');
    if (listContainer) {
      listContainer.scrollTo({
        top: listContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  function toggleStickToBottom() {
    if (!stickToBottom) {
      scrollToBottom();
    }

    setStickToBottom(!stickToBottom);
  }

  function onLogsUpdate() {
    if (stickToBottom) {
      scrollToBottom();
    }
  }

  return (
    <>
      <div className={cx(styles.container, { [styles.opened]: opened })}>
        <Header
          closeLogs={closeLogs}
          opened={opened}
          stickToBottom={stickToBottom}
          toggleStickToBottom={toggleStickToBottom}
        />
        <div className={styles.content}>
          {node && (
            <>
              <Filters filters={{ node: node.name }} />
              <LogsList node={node} onUpdate={onLogsUpdate} />
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
