import React from 'react';
import Calendar from '../../../../../components/Form/Calendar/Calendar';
import { Moment } from 'moment';

type Props = {
  setValue: Function;
  watch: Function;
};

function ModalLayoutCalendar({ setValue, watch }: Props) {
  return (
    <Calendar
      onChangeFromDateInput={(date: Moment) => setValue('startDate', date)}
      onChangeToDateInput={(date: Moment) => setValue('endDate', date)}
      formFromDate={watch('startDate')}
      formToDate={watch('endDate')}
      keepOpen
      autoFocus
      addTimeControls
      hideError
    />
  );
}

export default ModalLayoutCalendar;
