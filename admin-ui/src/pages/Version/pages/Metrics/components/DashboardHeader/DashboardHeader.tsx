import React from 'react';
import Calendar from '../../../../../../components/Form/Calendar/Calendar';
import ViewIcon from '@material-ui/icons/Visibility';
import HideIcon from '@material-ui/icons/VisibilityOff';
import styles from './DashboardHeader.module.scss';
import { Moment } from 'moment';

type Props = {
  runtimeName?: string;
  versionName?: string;
  value: Function;
  onChange: Function;
  submit: Function;
  viewAllData: boolean;
  setViewAllData: Function;
};
function DashboardHeader({
  runtimeName,
  versionName,
  value,
  onChange,
  submit,
  setViewAllData,
  viewAllData
}: Props) {
  const Icon = viewAllData ? HideIcon : ViewIcon;
  const buttonTitle = viewAllData
    ? 'Disable show all data values'
    : 'Enable show all data values';

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {`Metrics for ${runtimeName} - ${versionName}`}
      </div>
      <div className={styles.dateFilter}>
        <Calendar
          label=""
          onChangeFromDateInput={(date: Moment) => onChange('startDate', date)}
          onChangeToDateInput={(date: Moment) => onChange('endDate', date)}
          formFromDate={value('startDate')}
          formToDate={value('endDate')}
          addTimeControls
          hideError
        />
      </div>
      <div
        className={styles.visibilityIcon}
        onClick={() => setViewAllData(!viewAllData)}
        title={buttonTitle}
      >
        <Icon className="icon-regular" />
      </div>
    </div>
  );
}

export default DashboardHeader;
