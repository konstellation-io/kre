import React from 'react';
import Calendar from './Calendar';
import { shallow } from 'enzyme';
import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';

describe('Calendar', () => {
  let wrapper: any;

  const onChangeFromDateMock = jest.fn();
  const onChangeToDateMock = jest.fn();

  beforeEach(() => {
    wrapper = shallow(
      <Calendar
        label="calendar"
        hideError
        onChangeFromDateInput={onChangeFromDateMock}
        onChangeToDateInput={onChangeToDateMock}
      />
    );
  });

  it('matches snapshots', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('shows right components', () => {
    expect(wrapper.exists(DateRangePicker)).toBeTruthy();
    expect(wrapper.exists(InputLabel)).toBeTruthy();
    expect(wrapper.exists(InputError)).toBeFalsy();
  });

  it('shows error when any', () => {
    wrapper.setProps({ hideError: false });
    wrapper.setProps({ error: 'some error' });
    expect(wrapper.exists(InputError)).toBeTruthy();
    expect(wrapper.find(InputError).prop('message')).toBe('some error');
  });

  it('should call onChangeProp when DateRangePicker dates changes', () => {
    // Arrange.
    const startMock = moment();
    const endMock = moment();
    // Act.
    wrapper
      .find(DateRangePicker)
      .simulate('datesChange', { startDate: startMock, endDate: endMock });

    // Assert.
    expect(onChangeFromDateMock).toBeCalledWith(startMock);
    expect(onChangeToDateMock).toBeCalledWith(endMock);
  });
  // TODO: Check why Icons are changed to UNDEFINED in snapshots
});
