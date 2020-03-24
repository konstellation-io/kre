import React, { useState, useEffect } from 'react';

import Header from './components/Header/Header';
import Filters from './components/Filters/Filters';
import LogsList from './components/LogsList/LogsList';

import cx from 'classnames';
import styles from './Logs.module.scss';
import { useQuery } from '@apollo/react-hooks';
import { GET_CURRENT_LOG_PANEL } from '../../../../../graphql/client/queries/getCurrentLogPanel';

function Logs() {
  const [opened, setOpened] = useState<boolean>(false);
  const [stickToBottom, setStickToBottom] = useState<boolean>(false);
  const { data } = useQuery(GET_CURRENT_LOG_PANEL);

  useEffect(() => {
    setOpened(data && data.logPanel && data.logPanel.nodeId !== undefined);
  }, [data]);

  function togglePanel() {
    setOpened(!opened);
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
  const logPanel = data && data.logPanel;
  const hidden = !logPanel;
  return (
    <>
      <div
        className={cx(styles.container, {
          [styles.opened]: opened,
          [styles.hidden]: hidden
        })}
      >
        <Header
          togglePanel={togglePanel}
          opened={opened}
          stickToBottom={stickToBottom}
          toggleStickToBottom={toggleStickToBottom}
        />
        <div className={cx(styles.content, { [styles.opened]: opened })}>
          {logPanel && (
            <>
              <Filters filters={{ node: logPanel.nodeName }} />
              <LogsList
                nodeId={logPanel.nodeId}
                runtimeId={logPanel.runtimeId}
                onUpdate={onLogsUpdate}
              />
            </>
          )}
        </div>
      </div>
      <div
        className={cx(styles.shield, { [styles.show]: opened })}
        onClick={togglePanel}
      />
    </>
  );
}

export default Logs;
