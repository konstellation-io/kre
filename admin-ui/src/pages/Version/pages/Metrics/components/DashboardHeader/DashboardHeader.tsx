import Button from '../../../../../../components/Button/Button';
import Calendar from '../../../../../../components/Form/Calendar/Calendar';
import HideIcon from '@material-ui/icons/VisibilityOff';
import { Moment } from 'moment';
import React from 'react';
import ViewIcon from '@material-ui/icons/Visibility';
import styles from './DashboardHeader.module.scss';

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
          onClose={() => submit()}
          addTimeControls
          hideError
        />
      </div>
      <Button
        label=""
        className={styles.visibilityIcon}
        onClick={() => setViewAllData(!viewAllData)}
        title={buttonTitle}
        Icon={Icon}
        iconSize="icon-regular"
      />
    </div>
  );
}

export default DashboardHeader;
