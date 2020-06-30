import React, { useEffect } from 'react';

import { GetLogTabs_logTabs } from 'Graphql/client/queries/getLogs.graphql';
import Header from 'Components/Header/Header';
import { useApolloClient } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

type URLParams = {
  logTabInfo: string;
};

function Logs() {
  const client = useApolloClient();
  const { logTabInfo } = useParams<URLParams>();

  useEffect(() => {
    const tabInfo: GetLogTabs_logTabs = JSON.parse(
      decodeURIComponent(logTabInfo)
    );

    client.writeData({
      data: {
        logsOpened: true,
        activeTabId: tabInfo.uniqueId,
        logTabs: [tabInfo]
      }
    });
  }, [client, logTabInfo]);

  return <Header hideSettings />;
}

export default Logs;
