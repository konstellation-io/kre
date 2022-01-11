import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import Settings from './Settings';
import { label } from 'Utils/testUtilsEnzyme';
import { mount } from 'enzyme';

const mockDoLogout = jest.fn();

jest.mock('Hooks/useEndpoint', () => () => [{}, mockDoLogout]);

const Wrapper = () => (
  <BrowserRouter>
    <Settings label="some label" />
  </BrowserRouter>
);

describe('Settings', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<Wrapper />);
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
