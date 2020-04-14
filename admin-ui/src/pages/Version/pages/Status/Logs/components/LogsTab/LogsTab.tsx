import React, { useEffect, useState } from 'react';
import styles from './LogsTab.module.scss';
import Filters from '../Filters/Filters';
import LogsList from '../LogsList/LogsList';
import { useForm } from 'react-hook-form';
import moment from 'moment';

export interface FilterTypes {
  startDate: string;
  endDate: string;
}
type Props = {
  nodeName: string;
  nodeId: string;
  runtimeId: string;
};
function LogsTab({ nodeName, nodeId, runtimeId }: Props) {
  const [filterValues, setFilterValues] = useState<FilterTypes>({
    startDate: moment()
      .subtract(1, 'day')
      .startOf('day')
      .toISOString(true),
    endDate: moment()
      .endOf('day')
      .toISOString(true)
  });
  const { register, setValue, getValues, watch } = useForm({
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
      setFilterValues(actualFilterValue => ({
        ...actualFilterValue,
        startDate: startDate.toISOString(true),
        endDate: endDate.toISOString(true)
      }));
    }
  }, [startDateWatch, getValues]);

  return (
    <div className={styles.container}>
      <Filters filters={{ node: nodeName }} onDateChange={setValue} />
      <LogsList
        nodeId={nodeId}
        runtimeId={runtimeId}
        filterValues={filterValues}
      />
    </div>
  );
}

export default LogsTab;
