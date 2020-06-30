import React from 'react';
import Version from './Version';
import VersionSideBar from './components/VersionSideBar/VersionSideBar';
import { Switch } from 'react-router-dom';
import { shallow } from 'enzyme';

jest.mock('@apollo/react-hooks', () => ({
  useApolloClient: jest.fn(() => ({ writeData: jest.fn() }))
}));

describe('Version', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Version />);
  });

  it('shows right components', () => {
    expect(wrapper.exists(VersionSideBar)).toBeTruthy();
    expect(wrapper.exists(Switch)).toBeTruthy();
  });
});
