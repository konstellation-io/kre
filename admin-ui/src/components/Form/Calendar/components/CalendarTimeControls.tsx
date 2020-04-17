import React from 'react';
import styles from './CalendarTimeControls.module.scss';
import { Range } from '../Calendar';
import { Moment } from 'moment';
import Select from '../../Select/Select';
import { range } from 'd3-array';

type Props = {
  ranges: Range[];
  formFromDate: Moment | null;
  formToDate: Moment | null;
  changeFromDate: (date: Moment) => void;
  changeToDate: (date: Moment) => void;
};

function CalendarTimeControls({
  ranges,
  changeFromDate,
  changeToDate,
  formFromDate,
  formToDate
}: Props) {
  function onRangeClick({ startDate, endDate }: Range) {
    changeFromDate(startDate);
    changeToDate(endDate);
  }

  function updateDate(
    time: string,
    formField: Moment | null,
    setter: Function
  ) {
    const [hour, minute] = time.split(':').map((s: string) => parseInt(s));
    if (formField) {
      setter(
        formField.set({
          hour,
          minute
        })
      );
    }
  }

  const rangeItems = ranges.map((range: Range) => (
    <div key={range.label} onClick={() => onRangeClick(range)}>
      {range.label}
    </div>
  ));

  function formatTimeUnit(timeUnit: number) {
    return `0${timeUnit}`.slice(-2);
  }

  function getTimeOptions() {
    const hours = range(0, 24);
    const minutes = range(0, 60, 30);

    const times: string[] = [];

    hours.forEach((hour: number) => {
      const hourStr = formatTimeUnit(hour);
      minutes.forEach((minute: number) => {
        const minuteStr = formatTimeUnit(minute);
        times.push(`${hourStr}:${minuteStr}`);
      });
    });

    times[times.length - 1] = '23:59';

    return times;
  }

  const timeOptions = getTimeOptions();
  const startTimeOptions = [...timeOptions].slice(0, -1);
  const initialDatePosition = timeOptions.indexOf(
    formFromDate?.format('HH:mm') || '00:00'
  );
  const endTimeOptions = [...timeOptions].slice(initialDatePosition + 1);

  return (
    <div className={styles.container}>
      <div className={styles.col1}>
        <div className={styles.timeInput}>
          <Select
            selectMainClass={styles.select}
            label="To date time"
            options={startTimeOptions}
            onChange={(value: string) =>
              updateDate(value, formFromDate, changeFromDate)
            }
            formSelectedOption={formFromDate?.format('HH:mm')}
          />
        </div>
        <div className={styles.timeInput}>
          <Select
            selectMainClass={styles.select}
            label="To date time"
            options={endTimeOptions}
            onChange={(value: string) =>
              updateDate(value, formToDate, changeToDate)
            }
            formSelectedOption={formToDate?.format('HH:mm')}
          />
        </div>
      </div>
      <div className={styles.col2}>
        <div className={styles.title}>Quick ranges</div>
        <div className={styles.ranges}>{rangeItems}</div>
      </div>
    </div>
  );
}

export default CalendarTimeControls;
