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
    wrapper = shallow(<Settings label="some label" />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('Shows logout option', () => {
    expect(wrapper.exists({ label: 'LOGOUT' })).toBeTruthy();
  });

  it('handles logout action', () => {
    wrapper.find(label('LOGOUT')).simulate('click');
    expect(mockDoLogout).toHaveBeenCalledTimes(1);
  });
});
