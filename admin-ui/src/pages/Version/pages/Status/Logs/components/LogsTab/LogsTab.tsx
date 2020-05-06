import React, { useEffect, useState } from 'react';
import styles from './LogsTab.module.scss';
import Filters from '../Filters/Filters';
import AppliedFilters from '../AppliedFilters/AppliedFilters';
import LogsList from '../LogsList/LogsList';
import { useForm } from 'react-hook-form';
import { Moment } from 'moment';
import { GetServerLogs_logs_items } from '../../../../../../../graphql/queries/types/GetServerLogs';
import { TabFilters } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import {
  UPDATE_TAB_FILTERS,
  UpdateTabFilters,
  UpdateTabFiltersVariables
} from '../../../../../../../graphql/client/mutations/updateTabFilters.graphql';
import { useMutation } from '@apollo/react-hooks';

export interface FilterTypes {
  dateOption: string;
  startDate: Moment;
  endDate: Moment;
}
type Props = {
  nodeName: string;
  nodeId: string;
  runtimeId: string;
  workflowId: string;
  uniqueId: string;
  filterValues: TabFilters;
};
function LogsTab({
  nodeName,
  nodeId,
  runtimeId,
  workflowId,
  uniqueId,
  filterValues
}: Props) {
  const [logs, setLogs] = useState<GetServerLogs_logs_items[]>([]);
  const [updateTabFilters] = useMutation<
    UpdateTabFilters,
    UpdateTabFiltersVariables
  >(UPDATE_TAB_FILTERS);
  const { register, setValue, getValues, watch } = useForm<FilterTypes>({
    reValidateMode: 'onBlur'
  });
  const dateOptionWatch = watch('dateOption');

  useEffect(() => {
    register({ name: 'dateOption' });
    register({ name: 'startDate' });
    register({ name: 'endDate' });
  }, [register]);

  useEffect(() => {
    const { startDate, endDate, dateOption } = getValues();
    if (startDate && endDate) {
      updateTabFilters({
        variables: {
          input: {
            uniqueId,
            newFilters: {
              dateOption,
              startDate: startDate.toISOString(true),
              endDate: endDate.toISOString(true)
            }
          }
        }
      });
    }
  }, [dateOptionWatch, getValues, uniqueId, updateTabFilters]);

  function clearLogs() {
    setLogs([]);
  }

  return (
    <div className={styles.container}>
      <Filters filterValues={filterValues} onDateChange={setValue} />
      <AppliedFilters
        filters={{
          [nodeId ? `node` : `workflow`]: nodeName,
          other: 'otherValue'
        }}
      />
      <LogsList
        logs={logs}
        onNewLogs={setLogs}
        clearLogs={clearLogs}
        nodeId={nodeId}
        runtimeId={runtimeId}
        workflowId={workflowId}
        filterValues={filterValues}
      />
    </div>
  );
}

export default LogsTab;
