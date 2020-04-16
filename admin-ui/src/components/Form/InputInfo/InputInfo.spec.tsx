import React from 'react';
import { shallow } from 'enzyme';
import InputInfo from './InputInfo';

describe('InputInfo', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<InputInfo message="some message" />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
