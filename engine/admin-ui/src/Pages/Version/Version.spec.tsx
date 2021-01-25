import React from 'react';
import { Switch } from 'react-router-dom';
import Version from './Version';
import VersionSideBar from './components/VersionSideBar/VersionSideBar';
import { shallow } from 'enzyme';

jest.mock('index', () => ({
  API_BASE_URL: 'url'
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
