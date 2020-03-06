import React from 'react';
import Version from './Version';
import VersionSideBar from './components/VersionSideBar/VersionSideBar';
import { Switch } from 'react-router-dom';
import { shallow } from 'enzyme';

describe('Version', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Version refetch={jest.fn()} />);
  });

  it('shows right components', () => {
    expect(wrapper.exists(VersionSideBar)).toBeTruthy();
    expect(wrapper.exists(Switch)).toBeTruthy();
  });
});
