import React, { useEffect } from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import Header from '../../components/Header/Header';
import { useParams } from 'react-router-dom';

type URLParams = {
  logId: string;
};

function Logs() {
  const client = useApolloClient();
  const { logId } = useParams<URLParams>();
  const storageId = `KRELogTab-${logId}`;

  const tabInfo = JSON.parse(localStorage.getItem(storageId) || '');

  useEffect(() => {
    // TODO: study how to clean local storage only on tab close, not refresh
    function clearLocalStorage() {
      localStorage.removeItem(storageId);
    }

    client.writeData({
      data: {
        logsOpened: true,
        logsInFullScreen: true,
        activeTabId: logId,
        logTabs: [
          {
            ...tabInfo,
            uniqueId: logId
          }
        ]
      }
    });

    window.addEventListener('unload', clearLocalStorage);

    return () => window.removeEventListener('unload', clearLocalStorage);
  }, []);

  return <Header hideSettings />;
}

export default Logs;
