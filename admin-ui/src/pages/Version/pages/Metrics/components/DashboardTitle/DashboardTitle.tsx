import React from 'react';

import Calendar from '../../../../../../components/Form/Calendar/Calendar';

import styles from './DashboardTitle.module.scss';
import { Moment } from 'moment';

type Props = {
  runtimeName?: string;
  versionName?: string;
  value: Function;
  onChange: Function;
  submit: Function;
};
function DashboardTitle({
  runtimeName,
  versionName,
  value,
  onChange,
  submit
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {`Metrics for ${runtimeName} - ${versionName}`}
      </div>
      <div className={styles.dateFilter}>
        <Calendar
          label="filter by dates"
          onChangeFromDateInput={(date: Moment) => onChange('startDate', date)}
          onChangeToDateInput={(date: Moment) => onChange('endDate', date)}
          formFromDate={value('startDate')}
          formToDate={value('endDate')}
          submit={submit}
          addTimeControls
          hideError
        />
      </div>
    </div>
  );
}

export default DashboardTitle;
