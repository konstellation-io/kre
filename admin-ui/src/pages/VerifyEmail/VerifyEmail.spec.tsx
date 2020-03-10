import React from 'react';
import VerifyEmail from './VerifyEmail';
import { shallow } from 'enzyme';
import StateCircle from '../../components/Shape/StateCircle/StateCircle';

describe('VerifyEmail', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<VerifyEmail />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show correct texts', () => {
    expect(wrapper.exists(StateCircle)).toBeTruthy();
    expect(wrapper.exists('p')).toBeTruthy();
  });
});
