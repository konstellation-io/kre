import React, { useState, useEffect } from 'react';
import ModalContainer from '../../../../../../../../../components/Layout/ModalContainer/ModalContainer';
import moment, { Moment } from 'moment';
import styles from './DateFilter.module.scss';
import IconTime from '@material-ui/icons/AccessTime';
import Select, {
  SelectTheme
} from '../../../../../../../../../components/Form/Select/Select';
import Calendar from '../../../../../../../../../components/Form/Calendar/Calendar';
import { formatDate } from '../../../../../../../../../utils/format';
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
  formStartDate: string;
  formEndDate: string;
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

function DateFilter({
  updateFilters,
  selectedOption,
  formStartDate,
  formEndDate
}: Props) {
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
        endDate: null
      });
    } else {
      setShowCalendar(true);
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
        hideError
      />
      <div className={styles.dateValues}>
        <div className={styles.dateValue}>
          <div>From</div>
          <span>{` ${formatDate(new Date(formStartDate), true)}`}</span>
        </div>
        {showEndDate && (
          <div className={styles.dateValue}>
            <div>To</div>
            <span>{` ${formatDate(new Date(formEndDate), true)}`}</span>
          </div>
        )}
      </div>
    </>
  );
}

export default DateFilter;
