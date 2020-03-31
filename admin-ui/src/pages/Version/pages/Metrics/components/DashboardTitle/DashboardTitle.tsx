import React from 'react';

import Calendar from '../../../../../../components/Form/Calendar/Calendar';

import styles from './DashboardTitle.module.scss';
import { Moment } from 'moment';

type Props = {
  runtimeName?: string;
  versionName?: string;
  value: Function;
  onChange: Function;
  summit: Function;
};
function DashboardTitle({
  runtimeName,
  versionName,
  value,
  onChange,
  summit
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {`Metrics for ${runtimeName} - ${versionName}`}
      </div>
      <div className={styles.dateFilter}>
        <Calendar
          label="filter by dates"
          onChangeFromDate={(date: Moment) => onChange('startDate', date)}
          onChangeToDate={(date: Moment) => onChange('endDate', date)}
          formFromDate={value('startDate')}
          formToDate={value('endDate')}
          summit={summit}
          addExtension
          hideError
        />
      </div>
    </div>
  );
}

export default DashboardTitle;
