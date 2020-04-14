import React, { useState } from 'react';
import moment from 'moment';
import styles from './DateFilter.module.scss';
import Select from '../../../../../../../../../components/Form/Select/Select';

type Props = {
  onDateChange: Function;
};
enum dateFilterOptions {
  lastHour = 'LAST HOUR',
  lastSixHours = 'LAST 6 HOURS',
  lastTwentyFourHours = 'LAST 24 HOURS',
  lastSevenDays = 'LAST 7 DAYS',
  customDates = 'CUSTOM'
}
function DateFilter({ onDateChange }: Props) {
  const [dateOption, setDateOption] = useState<string>('');

  const handleDateOption = (value: string) => {
    setDateOption(value);
    if (value !== dateFilterOptions.customDates) {
      let hoursToSubtract;
      switch (value) {
        case dateFilterOptions.lastHour:
          hoursToSubtract = 1;
          break;
        case dateFilterOptions.lastSixHours:
          hoursToSubtract = 6;
          break;
        case dateFilterOptions.lastTwentyFourHours:
          hoursToSubtract = 24;
          break;
        case dateFilterOptions.lastSevenDays:
          hoursToSubtract = 168;
          break;
      }
      onDateChange([
        { startDate: moment().subtract(hoursToSubtract, 'hour') },
        { endDate: moment().endOf('day') }
      ]);
    }
  };

  return (
    <Select
      shouldSort={false}
      selectMainClass={styles.dateFilter}
      options={Object.values(dateFilterOptions)}
      onChange={handleDateOption}
      formSelectedOption={dateOption}
      defaultOption={dateFilterOptions.lastTwentyFourHours}
    />
  );
}

export default DateFilter;
