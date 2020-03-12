import React from 'react';
import Calendar from './Calendar';
import { shallow } from 'enzyme';

describe('Calendar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Calendar label="calendar" />);
  });

  it('matches snapshots', () => {
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: add more tests
  // TODO: Check why Icons are changed to UNDEFINED in snapshots
});
