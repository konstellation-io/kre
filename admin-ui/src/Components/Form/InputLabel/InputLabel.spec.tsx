import React from 'react';
import { shallow } from 'enzyme';
import InputLabel from './InputLabel';

describe('InputLabel', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<InputLabel text="some message" />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
