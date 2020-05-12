import React, { useState } from 'react';
import styles from './LogsTab.module.scss';
import Filters from '../Filters/Filters';
import AppliedFilters from '../AppliedFilters/AppliedFilters';
import LogsList from '../LogsList/LogsList';
import { Moment } from 'moment';
import { GetServerLogs_logs_items } from '../../../../../../../graphql/queries/types/GetServerLogs';
import { GetLogTabs_logTabs_filters } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import {
  UPDATE_TAB_FILTERS,
  UpdateTabFilters,
  UpdateTabFiltersVariables,
  UpdateTabFiltersInput_newFilters
} from '../../../../../../../graphql/client/mutations/updateTabFilters.graphql';
import { useMutation } from '@apollo/react-hooks';
import { LogLevel } from '../../../../../../../graphql/types/globalTypes';
import { ProcessSelection } from '../../../../../../../graphql/client/typeDefs';

export interface FilterTypes {
  dateOption: string;
  startDate: Moment;
  endDate: Moment;
  processes: ProcessSelection[];
  level: LogLevel;
  search: string;
}
type Props = {
  runtimeId: string;
  versionId: string;
  uniqueId: string;
  filterValues: GetLogTabs_logTabs_filters;
};
function LogsTab({ runtimeId, versionId, uniqueId, filterValues }: Props) {
  const [logs, setLogs] = useState<GetServerLogs_logs_items[]>([]);
  const [updateTabFilters] = useMutation<
    UpdateTabFilters,
    UpdateTabFiltersVariables
  >(UPDATE_TAB_FILTERS);

  function updateFilters(
    newFilters: UpdateTabFiltersInput_newFilters,
    remove: boolean
  ) {
    updateTabFilters({
      variables: {
        input: {
          uniqueId,
          remove,
          newFilters: {
            ...newFilters
          }
        }
      }
    });
  }
  function removeFilters(newFilters: UpdateTabFiltersInput_newFilters) {
    updateFilters(newFilters, true);
  }

  function clearLogs() {
    setLogs([]);
  }

  return (
    <div className={styles.container}>
      <Filters
        updateFilters={updateFilters}
        filterValues={filterValues}
        versionId={versionId}
      />
      <AppliedFilters filters={filterValues} removeFilters={removeFilters} />
      <LogsList
        logs={logs}
        onNewLogs={setLogs}
        clearLogs={clearLogs}
        runtimeId={runtimeId}
        filterValues={filterValues}
      />
    </div>
  );
}

export default LogsTab;
