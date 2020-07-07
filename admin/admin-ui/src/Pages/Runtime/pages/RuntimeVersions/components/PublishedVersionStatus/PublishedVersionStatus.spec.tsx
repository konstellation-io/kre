import React from 'react';
import { shallow } from 'enzyme';
import PublishedVersionStatus from './PublishedVersionStatus';

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({ runtimeId: 'runtimeId' }))
}));

describe('PublishedVersionStatus', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <PublishedVersionStatus nPublishedVersions={5} noVersions={false} />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
