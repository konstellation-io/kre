import React from 'react';
import TimePicker from 'react-time-picker';
import styles from './CalendarExtension.module.scss';
import InputLabel from '../../InputLabel/InputLabel';
import { Range } from '../Calendar';
import { Moment } from 'moment';

type Props = {
  ranges: Range[];
  formFromDate: Moment | null;
  formToDate: Moment | null;
  changeFromDate: (date: Moment) => void;
  changeToDate: (date: Moment) => void;
};

function CalendarExtension({
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
    const [hour, minute, second] = time
      .split(':')
      .map((s: string) => parseInt(s));
    if (formField) {
      setter(
        formField.set({
          hour,
          minute,
          second
        })
      );
    }
  }

  const rangeItems = ranges.map((range: Range) => (
    <div key={range.label} onClick={() => onRangeClick(range)}>
      {range.label}
    </div>
  ));

  return (
    <div className={styles.container}>
      <div className={styles.col1}>
        <div className={styles.timeInput}>
          <InputLabel text="From date time" />
          <TimePicker
            disableClock
            clockIcon={null}
            maxDetail="second"
            value={formFromDate?.format('HH:mm:ss')}
            onChange={(time: string) =>
              updateDate(time, formFromDate, changeFromDate)
            }
          />
        </div>
        <div className={styles.timeInput}>
          <InputLabel text="To date time" />
          <TimePicker
            disableClock
            clockIcon={null}
            maxDetail="second"
            value={formToDate?.format('HH:mm:ss')}
            onChange={(time: string) =>
              updateDate(time, formToDate, changeToDate)
            }
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

export default CalendarExtension;
