import React from 'react';

import Calendar from '../../../../../../components/Form/Calendar/Calendar';

import styles from './DashboardTitle.module.scss';
import { Moment } from 'moment';

type Props = {
  runtimeName?: string;
  versionName?: string;
  formWatch: Function;
  formSetValue: Function;
};
function DashboardTitle({
  runtimeName,
  versionName,
  formWatch,
  formSetValue
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {`Metrics for ${runtimeName} - ${versionName}`}
      </div>
      <div className={styles.dateFilter}>
        <Calendar
          label="filter by dates"
          hideError
          onChangeFromDate={(value: Moment) => formSetValue('startDate', value)}
          onChangeToDate={(value: Moment) => formSetValue('endDate', value)}
          formFromDate={formWatch('startDate')}
          formToDate={formWatch('endDate')}
        />
      </div>
    </div>
  );
}

export default DashboardTitle;
