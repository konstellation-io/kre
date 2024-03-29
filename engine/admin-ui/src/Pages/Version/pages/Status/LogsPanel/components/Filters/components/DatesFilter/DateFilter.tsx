import {
  CustomOptionProps,
  ModalContainer,
  ModalLayoutCalendar,
  Select,
  SelectTheme
} from 'kwc';
import React, { useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { registerMany, unregisterMany } from 'Utils/react-forms';

import IconOptions from '@material-ui/icons/MoreHoriz';
import IconTime from '@material-ui/icons/AccessTime';
import { formatDate } from 'Utils/format';
import styles from './DateFilter.module.scss';
import { useForm } from 'react-hook-form';

type FormData = {
  startDate: Moment;
  endDate: Moment;
};

const DEFAULT_DATES: FormData = {
  startDate: moment()
    .subtract(30, 'days')
    .startOf('day'),
  endDate: moment().endOf('day')
};

function CustomRange({ label }: CustomOptionProps) {
  return (
    <div className={styles.customRangesOption}>
      <IconOptions className="icon-small" />
      <div>{label}</div>
    </div>
  );
}

type Props = {
  updateFilters: Function;
  selectedOption?: string;
  formStartDate?: string;
  formEndDate?: string;
};
export const dateFilterOptions: { [key: string]: string } = {
  lastHour: 'LAST HOUR',
  lastSixHours: 'LAST 6 HOURS',
  lastTwentyFourHours: 'LAST 24 HOURS',
  lastSevenDays: 'LAST 7 DAYS',
  customDates: 'CUSTOM RANGE'
};

const dateOptionToHours: { [key: string]: number } = {
  [dateFilterOptions.lastHour]: 1,
  [dateFilterOptions.lastSixHours]: 6,
  [dateFilterOptions.lastTwentyFourHours]: 24,
  [dateFilterOptions.lastSevenDays]: 168
};

function DateFilter({
  updateFilters,
  selectedOption,
  formStartDate,
  formEndDate
}: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const { unregister, register, watch, setValue, handleSubmit } = useForm<
    FormData
  >({
    defaultValues: {
      startDate: DEFAULT_DATES.startDate,
      endDate: DEFAULT_DATES.endDate
    }
  });

  useEffect(() => {
    const fields = ['startDate', 'endDate'];
    registerMany(register, fields);

    return () => unregisterMany(unregister, fields);
  }, [register, unregister]);

  function submitCustomDates() {
    handleSubmit(({ startDate, endDate }: FormData) => {
      updateFilters({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      setShowCalendar(false);
    })();
  }

  const handleDateOption = (value: string) => {
    if (value !== dateFilterOptions.customDates) {
      const hoursToSubtract = dateOptionToHours[value] || 1;
      updateFilters({
        startDate: moment()
          .subtract(hoursToSubtract, 'hour')
          .toISOString(),
        endDate: null,
        dateOption: value
      });
    } else {
      setShowCalendar(true);
      updateFilters({ dateOption: value });
    }
  };

  const showEndDate = selectedOption === dateFilterOptions.customDates;

  return (
    <>
      {showCalendar && (
        <div className={styles.modal}>
          <ModalContainer
            title="SELECT A DATE RANGE"
            onAccept={submitCustomDates}
            onCancel={() => setShowCalendar(false)}
            className={styles.calendarModal}
            blocking
          >
            <ModalLayoutCalendar setValue={setValue} watch={watch} />
          </ModalContainer>
        </div>
      )}
      <div className={styles.icon}>
        <IconTime className="icon-small" />
      </div>
      <Select
        shouldSort={false}
        selectMainClass={styles.dateFilter}
        options={Object.values(dateFilterOptions)}
        onChange={handleDateOption}
        formSelectedOption={selectedOption}
        theme={SelectTheme.LIGHT}
        CustomOptions={{
          [dateFilterOptions.customDates]: CustomRange
        }}
        hideError
      />
      <div className={styles.dateValues}>
        <div className={styles.dateValue}>
          <div>From</div>
          <span>{` ${formStartDate &&
            formatDate(new Date(formStartDate), true)}`}</span>
        </div>
        {showEndDate && (
          <div className={styles.dateValue}>
            <div>To</div>
            <span>{` ${formEndDate &&
              formatDate(new Date(formEndDate), true)}`}</span>
          </div>
        )}
      </div>
    </>
  );
}

export default DateFilter;
