import React from 'react';
import Filters from './Filters';
import { shallow } from 'enzyme';
import * as apolloClient from '@apollo/client';

apolloClient.useQuery = jest.fn(() => ({}));

describe('Filters', () => {
  let wrapper: any;

  const onDateChangeMock = jest.fn();

  beforeEach(() => {
    wrapper = shallow(
      <Filters
        updateFilters={onDateChangeMock}
        versionName={'version'}
        filterValues={{
          __typename: 'logTabFilters',
          startDate: '2020-01-01',
          endDate: '2020-01-01',
          dateOption: '2020-01-01'
        }}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
