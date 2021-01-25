import React, { useState } from 'react';
import useLogs, {
  UpdateTabFiltersVariables_newFilters
} from 'Graphql/hooks/useLogs';

import AppliedFilters from '../AppliedFilters/AppliedFilters';
import Filters from '../Filters/Filters';
import { GetLogTabs_logTabs_filters } from 'Graphql/client/queries/getLogs.graphql';
import { GetServerLogs_logs_items } from 'Graphql/queries/types/GetServerLogs';
import { LogLevel } from 'Graphql/types/globalTypes';
import LogsList from '../LogsList/LogsList';
import { Moment } from 'moment';
import { NodeSelection } from 'Graphql/client/typeDefs';
import styles from './LogsTab.module.scss';

export interface FilterTypes {
  dateOption: string;
  startDate: Moment;
  endDate: Moment;
  nodes: NodeSelection[];
  levels: LogLevel[];
  search: string;
}
type Props = {
  runtimeId: string;
  versionName: string;
  uniqueId: string;
  filterValues: GetLogTabs_logTabs_filters;
};
function LogsTab({ runtimeId, versionName, uniqueId, filterValues }: Props) {
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
    nodes: filterValues.nodes || null,
    search: filterValues.search || null
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
