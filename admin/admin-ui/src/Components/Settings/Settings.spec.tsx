import React from 'react';
import Settings from './Settings';
import { label } from 'Utils/testUtilsEnzyme';
import { shallow } from 'enzyme';

const mockDoLogout = jest.fn();

jest.mock('@apollo/client');
jest.mock('react-router');
jest.mock('Hooks/useEndpoint', () => jest.fn(() => [{}, mockDoLogout]));

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
    expect(wrapper.find('.options').prop('style').maxHeight).toBe(120);
  });

  it('handles logout action', () => {
    wrapper.find(label('LOGOUT')).simulate('click');
    expect(mockDoLogout).toHaveBeenCalledTimes(1);
  });
});
