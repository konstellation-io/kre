import Alert from './Alert';
import { Button } from 'kwc';
import React from 'react';
import { shallow } from 'enzyme';

describe('App', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <Alert type="ERROR" message="some message" runtimeId="runtimeID" />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('shows right components', () => {
    expect(wrapper.exists(Button)).toBeTruthy();
    expect(wrapper.find('.message').text()).toBe('some message');
  });
});
