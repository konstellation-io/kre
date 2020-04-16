import React, { useEffect, useState } from 'react';
import styles from './LogsTab.module.scss';
import Filters from '../Filters/Filters';
import LogsList from '../LogsList/LogsList';
import { useForm } from 'react-hook-form';
import moment, { Moment } from 'moment';
import { GetServerLogs_logs_items } from '../../../../../../../graphql/queries/types/GetServerLogs';

export interface FilterTypes {
  startDate: Moment;
  endDate: Moment;
}
type Props = {
  nodeName: string;
  nodeId: string;
  runtimeId: string;
  workflowId?: string;
};
function LogsTab({ nodeName, nodeId, runtimeId, workflowId = '' }: Props) {
  const [logs, setLogs] = useState<GetServerLogs_logs_items[]>([]);
  const [filterValues, setFilterValues] = useState<FilterTypes>({
    startDate: moment()
      .subtract(1, 'day')
      .startOf('day'),
    endDate: moment().endOf('day')
  });
  const { register, setValue, getValues, watch } = useForm<FilterTypes>({
    reValidateMode: 'onBlur'
  });
  const startDateWatch = watch('startDate');

  useEffect(() => {
    register({ name: 'startDate' });
    register({ name: 'endDate' });
  }, [register]);

  useEffect(() => {
    const { startDate, endDate } = getValues();
    if (startDate && endDate) {
      setFilterValues((actualFilterValue: FilterTypes) => ({
        ...actualFilterValue,
        startDate,
        endDate
      }));
    }
  }, [startDateWatch, getValues]);

  return (
    <div className={styles.container}>
      <Filters
        filters={{ [nodeId ? `node` : `workflow`]: nodeName }}
        onDateChange={setValue}
      />
      <LogsList
        logs={logs}
        onNewLogs={setLogs}
        nodeId={nodeId}
        runtimeId={runtimeId}
        workflowId={workflowId}
        filterValues={filterValues}
      />
    </div>
  );
}

export default LogsTab;
