import React, { useEffect } from 'react';

import Header from 'Components/Header/Header';
import { LogPanel } from 'Graphql/client/typeDefs';
import useLogs from 'Graphql/hooks/useLogs';
import { useParams } from 'react-router-dom';

type URLParams = {
  logTabInfo: string;
};

function Logs() {
  const { initializeLogsPanel } = useLogs();
  const { logTabInfo } = useParams<URLParams>();

  useEffect(() => {
    const tabInfo: LogPanel = JSON.parse(decodeURIComponent(logTabInfo));
    initializeLogsPanel(tabInfo);
  }, [logTabInfo, initializeLogsPanel]);

  return <Header hideSettings />;
}

export default Logs;
