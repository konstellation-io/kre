import React, { useState, useEffect } from 'react';
import ModalContainer from '../../../../../../../../../components/Layout/ModalContainer/ModalContainer';
import moment, { Moment } from 'moment';
import styles from './DateFilter.module.scss';
import Select, {
  SelectorType
} from '../../../../../../../../../components/Form/Select/Select';
import Calendar from '../../../../../../../../../components/Form/Calendar/Calendar';
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

type Props = {
  updateFilters: Function;
  selectedOption: string;
};
export const dateFilterOptions: { [key: string]: string } = {
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

function DateFilter({ updateFilters, selectedOption }: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const { register, watch, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      startDate: DEFAULT_DATES.startDate,
      endDate: DEFAULT_DATES.endDate
    }
  });

  useEffect(() => {
    register({ name: 'startDate' });
    register({ name: 'endDate' });
  }, [register]);

  function submitCustomDates() {
    handleSubmit(({ startDate, endDate }: FormData) => {
      updateFilters({
        startDate: startDate.toISOString(true),
        endDate: endDate.toISOString(true)
      });
      setShowCalendar(false);
    })();
  }

  const handleDateOption = (value: string) => {
    updateFilters({ dateOption: value });

    if (value !== dateFilterOptions.customDates) {
      const hoursToSubtract = dateOptionToHours[value] || 1;
      updateFilters({
        startDate: moment()
          .subtract(hoursToSubtract, 'hour')
          .toISOString(true),
        endDate: moment()
          .endOf('day')
          .toISOString(true)
      });
    } else {
      setShowCalendar(true);
    }
  };

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
            <Calendar
              onChangeFromDateInput={(date: Moment) =>
                setValue('startDate', date)
              }
              onChangeToDateInput={(date: Moment) => setValue('endDate', date)}
              formFromDate={watch('startDate')}
              formToDate={watch('endDate')}
              keepOpen
              autoFocus
              addTimeControls
              hideError
            />
          </ModalContainer>
        </div>
      )}
      <Select
        shouldSort={false}
        selectMainClass={styles.dateFilter}
        options={Object.values(dateFilterOptions)}
        onChange={handleDateOption}
        formSelectedOption={selectedOption}
        type={SelectorType.LIGHT}
      />
    </>
  );
}

export default DateFilter;
