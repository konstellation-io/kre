import Circle from 'Components/Shape/Circle/Circle';
import React from 'react';
import VerifyEmail from './VerifyEmail';
import { shallow } from 'enzyme';

describe('VerifyEmail', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<VerifyEmail />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show correct texts', () => {
    expect(wrapper.exists(Circle)).toBeTruthy();
    expect(wrapper.exists('p')).toBeTruthy();
  });
});
