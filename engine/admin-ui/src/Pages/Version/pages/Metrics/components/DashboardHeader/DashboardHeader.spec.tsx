import DashboardHeader from './DashboardHeader';
import React from 'react';
import { shallow } from 'enzyme';

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({ versionName: '' }))
}));

describe('DashboardTitle', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <DashboardHeader
        runtimeName="runtimeName"
        versionName="versionName"
        onChange={jest.fn()}
        value={jest.fn()}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
