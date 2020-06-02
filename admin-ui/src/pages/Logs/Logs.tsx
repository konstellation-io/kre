import React, { useEffect } from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import Header from '../../components/Header/Header';
import { useParams } from 'react-router-dom';
import { GetLogTabs_logTabs } from '../../graphql/client/queries/getLogs.graphql';

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
