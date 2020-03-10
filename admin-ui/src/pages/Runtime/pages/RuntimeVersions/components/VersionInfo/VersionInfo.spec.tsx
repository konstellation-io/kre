import React from 'react';
import { shallow } from 'enzyme';
import { version } from '../../../../../../mocks/version';
import VersionInfo from './VersionInfo';

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
