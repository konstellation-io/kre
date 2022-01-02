import { runtime, version } from 'Mocks/version';

import Metrics from './Metrics';
import React from 'react';
import { shallow } from 'enzyme';
import * as apolloClient from '@apollo/client';

apolloClient.useQuery = jest.fn(() => ({
  data: {},
  loading: false,
  error: '',
  refetch: jest.fn()
}));
jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({ versionName: '' }))
}));

// TODO: test GraphQL data
describe('Metrics', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<Metrics runtime={runtime} version={version} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
