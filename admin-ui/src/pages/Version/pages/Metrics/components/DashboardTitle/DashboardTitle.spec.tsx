import React from 'react';
import { shallow } from 'enzyme';
import DashboardTitle from './DashboardTitle';

describe('DashboardTitle', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <DashboardTitle runtimeName="runtimeName" versionName="versionName" />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
