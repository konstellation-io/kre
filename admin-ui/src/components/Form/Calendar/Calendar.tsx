import React, { useState, useEffect } from 'react';
import moment, { Moment } from 'moment';
import { isInclusivelyBeforeDay } from 'react-dates';

import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import ArrowRightIcon from '@material-ui/icons/ArrowForward';
import ArrowLeftIcon from '@material-ui/icons/ArrowBack';
import { DateRangePicker } from 'react-dates';

type Props = {
  label?: string;
  error?: string | boolean;
  formFromDate?: Moment | null;
  formToDate?: Moment | null;
  onChangeFromDate?: Function;
  onChangeToDate?: Function;
};

function Calendar({
  label = '',
  error = '',
  formFromDate = null,
  formToDate = null,
  onChangeFromDate = function() {},
  onChangeToDate = function() {}
}: Props) {
  const [fromDate, setFromDate] = useState<Moment | null>(null);
  const [toDate, setToDate] = useState<Moment | null>(null);
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    setFromDate(formFromDate);
  }, [formFromDate]);

  useEffect(() => {
    setToDate(formToDate);
  }, [formToDate]);

  return (
    <div>
      <InputLabel text={label} />
      <DateRangePicker
        startDate={fromDate}
        startDateId="calendar_from_date"
        startDatePlaceholderText="From Date"
        endDate={toDate}
        endDateId="calendar_to_date"
        endDatePlaceholderText="To Date"
        onDatesChange={({ startDate, endDate }: any) => {
          setFromDate(startDate);
          onChangeFromDate(startDate);
          setToDate(endDate);
          onChangeToDate(endDate);
          setFocusedInput(focusedInput);
        }}
        focusedInput={focusedInput}
        onFocusChange={(input: any) => setFocusedInput(input)}
        customArrowIcon={<ArrowRightIcon className="icon-small" />}
        navPrev={
          <div className="DayPickerNavigation_button DayPickerNavigation_button_1 DayPickerNavigation_button__default DayPickerNavigation_button__default_2 DayPickerNavigation_button__horizontal DayPickerNavigation_button__horizontal_3 DayPickerNavigation_button__horizontalDefault DayPickerNavigation_button__horizontalDefault_4 DayPickerNavigation_leftButton__horizontalDefault DayPickerNavigation_leftButton__horizontalDefault_5">
            <ArrowLeftIcon className="icon-small" style={{ margin: '0 8px' }} />
          </div>
        }
        navNext={
          <div className="DayPickerNavigation_button DayPickerNavigation_button_1 DayPickerNavigation_button__default DayPickerNavigation_button__default_2 DayPickerNavigation_button__horizontal DayPickerNavigation_button__horizontal_3 DayPickerNavigation_button__horizontalDefault DayPickerNavigation_button__horizontalDefault_4 DayPickerNavigation_rightButton__horizontalDefault DayPickerNavigation_rightButton__horizontalDefault_5">
            <ArrowRightIcon
              className="icon-small"
              style={{ margin: '0 8px' }}
            />
          </div>
        }
        isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
        minimumNights={0}
      />
      {error !== false && <InputError message={error.toString()} />}
    </div>
  );
}

export default Calendar;
