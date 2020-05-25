import React from 'react';
import { shallow } from 'enzyme';
import DashboardHeader from './DashboardHeader';

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({ runtimeId: '', versionId: '' }))
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
