import React from 'react';
import { shallow } from 'enzyme';
import InputError from './InputError';

describe('InputError', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<InputError message="some message" />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
