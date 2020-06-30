import React from 'react';
import Alert from './Alert';
import { shallow } from 'enzyme';
import Button from '../Button/Button';

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
