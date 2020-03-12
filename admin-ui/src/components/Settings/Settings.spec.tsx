import React from 'react';
import Settings from './Settings';
import { shallow } from 'enzyme';

jest.mock('@apollo/react-hooks');
jest.mock('react-router');

describe('Settings', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Settings />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('Shows logout option', () => {
    expect(wrapper.exists({ label: 'LOGOUT' })).toBeTruthy();
  });

  it('Shows options on mouse click', () => {
    expect(wrapper.find('.options').prop('style').maxHeight).toBe(0);

    wrapper.find('.container').simulate('click');
    expect(wrapper.find('.options').prop('style').maxHeight).not.toBe(0);

    wrapper.find('.container').simulate('click');
    expect(wrapper.find('.options').prop('style').maxHeight).toBe(0);
  });
});

//TODO: make logout test
