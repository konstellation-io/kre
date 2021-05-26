import React, { useState } from 'react';
import useLogs, {
  UpdateTabFiltersVariables_newFilters
} from 'Graphql/hooks/useLogs';

import AppliedFilters from '../AppliedFilters/AppliedFilters';
import Filters from '../Filters/Filters';
import { GetServerLogs_logs_items } from 'Graphql/queries/types/GetServerLogs';
import LogsList from '../LogsList/LogsList';
import { LogPanelFilters } from 'Graphql/client/typeDefs';
import styles from './LogsTab.module.scss';

type Props = {
  runtimeId: string;
  versionName: string;
  uniqueId: string;
  filterValues: LogPanelFilters;
};
function LogsTab({
  runtimeId,
  versionName,
  uniqueId = '',
  filterValues
}: Props) {
  const { updateTabFilters, resetTabFilters } = useLogs();

  const [logs, setLogs] = useState<GetServerLogs_logs_items[]>([]);

  function updateFilters(newFilters: UpdateTabFiltersVariables_newFilters) {
    updateTabFilters({ tabId: uniqueId, newFilters });
  }

  function resetFilters() {
    resetTabFilters(uniqueId);
  }

  function clearLogs() {
    setLogs([]);
  }

  const displayableFilters = {
    nodes: filterValues?.nodes || null,
    search: filterValues?.search || null
  };

  return (
    <div className={styles.container}>
      <Filters
        updateFilters={updateFilters}
        filterValues={filterValues}
        versionName={versionName}
      />
      <AppliedFilters
        filters={displayableFilters}
        updateFilters={updateFilters}
        versionName={versionName}
        resetFilters={resetFilters}
      />
      <LogsList
        logs={logs}
        onNewLogs={setLogs}
        clearLogs={clearLogs}
        runtimeId={runtimeId}
        versionName={versionName}
        filterValues={filterValues}
      />
    </div>
  );
}

export default LogsTab;
