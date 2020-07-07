import React from 'react';
import VersionInfo from './VersionInfo';
import { shallow } from 'enzyme';
import { version } from 'Mocks/version';

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({ runtimeId: 'runtimeId' }))
}));

describe('VersionInfo', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<VersionInfo version={version} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
