import React from 'react';
import { shallow } from 'enzyme';
import StateCircle from './StateCircle';

describe('StateCircle', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<StateCircle />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
