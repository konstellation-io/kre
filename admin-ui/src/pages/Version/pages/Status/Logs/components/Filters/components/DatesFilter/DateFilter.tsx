import React, { useState } from 'react';
import moment from 'moment';
import styles from './DateFilter.module.scss';
import Select from '../../../../../../../../../components/Form/Select/Select';

type Props = {
  onDateChange: Function;
};
const dateFilterOptions: { [key: string]: string } = {
  lastHour: 'LAST HOUR',
  lastSixHours: 'LAST 6 HOURS',
  lastTwentyFourHours: 'LAST 24 HOURS',
  lastSevenDays: 'LAST 7 DAYS',
  customDates: 'CUSTOM'
};

const dateOptionToHours: { [key: string]: number } = {
  [dateFilterOptions.lastHour]: 1,
  [dateFilterOptions.lastSixHours]: 6,
  [dateFilterOptions.lastTwentyFourHours]: 24,
  [dateFilterOptions.lastSevenDays]: 168
};

function DateFilter({ onDateChange }: Props) {
  const [dateOption, setDateOption] = useState<string>('');

  const handleDateOption = (value: string) => {
    setDateOption(value);
    if (dateFilterOptions[value] !== dateFilterOptions.customDates) {
      const hoursToSubtract = dateOptionToHours[value] || 1;
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
