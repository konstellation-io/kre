import { runtime, version } from 'Mocks/version';

import React from 'react';
import VersionActions from './VersionActions/VersionActions';
import VersionInfo from './VersionInfo/VersionInfo';
import VersionMenu from './VersionMenu/VersionMenu';
import VersionSideBar from './VersionSideBar';
import { shallow } from 'enzyme';

jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [jest.fn(), { loading: false }])
}));

describe('VersionSideBar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<VersionSideBar version={version} runtime={runtime} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', async () => {
    expect(wrapper.exists(VersionInfo)).toBeTruthy();
    expect(wrapper.exists(VersionMenu)).toBeTruthy();
    expect(wrapper.exists(VersionActions)).toBeTruthy();
    expect('a').toBeTruthy();
  });

  it('do now show when there is no runtime', async () => {
    wrapper.setProps({ runtime: undefined });
    expect(wrapper.find(VersionSideBar).exists('.wrapper')).toBeFalsy();
  });

  it('do now show when there is no version', async () => {
    wrapper.setProps({ version: undefined });
    expect(wrapper.find(VersionSideBar).exists('.wrapper')).toBeFalsy();
  });
});
