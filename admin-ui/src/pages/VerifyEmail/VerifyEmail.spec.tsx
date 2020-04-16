import React from 'react';
import VerifyEmail from './VerifyEmail';
import { shallow } from 'enzyme';
import Circle from '../../components/Shape/Circle/Circle';

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
