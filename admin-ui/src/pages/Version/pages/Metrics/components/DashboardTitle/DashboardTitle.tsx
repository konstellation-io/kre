import React from 'react';

import Calendar from '../../../../../../components/Form/Calendar/Calendar';

import styles from './DashboardTitle.module.scss';

type Props = {
  runtimeName?: string;
  versionName?: string;
};
function DashboardTitle({ runtimeName, versionName }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {`Metrics for ${runtimeName} - ${versionName}`}
      </div>
      <div className={styles.dateFilter}>
        <Calendar
          label="filter by dates"
          // error={ false }
        />
      </div>
    </div>
  );
}

export default DashboardTitle;
