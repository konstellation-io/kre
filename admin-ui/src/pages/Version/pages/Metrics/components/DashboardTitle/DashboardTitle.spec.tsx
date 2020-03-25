import React from 'react';
import { shallow } from 'enzyme';
import DashboardTitle from './DashboardTitle';

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({ runtimeId: '', versionId: '' }))
}));

describe('DashboardTitle', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <DashboardTitle
        runtimeName="runtimeName"
        versionName="versionName"
        formSetValue={jest.fn()}
        formWatch={jest.fn()}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
