import React from 'react';
import Calendar from './Calendar';
import { shallow } from 'enzyme';
import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import { DateRangePicker } from 'react-dates';

describe('Calendar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Calendar label="calendar" />);
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
    wrapper.setProps({ error: 'some error' });
    expect(wrapper.exists(InputError)).toBeTruthy();
    expect(wrapper.find(InputError).prop('message')).toBe('some error');
  });

  // TODO: Check why Icons are changed to UNDEFINED in snapshots
});
