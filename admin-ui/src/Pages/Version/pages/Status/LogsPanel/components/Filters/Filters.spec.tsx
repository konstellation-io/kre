import React from 'react';
import Filters from './Filters';
import { shallow } from 'enzyme';

jest.mock('@apollo/react-hooks', () => ({
  useQuery: jest.fn(() => ({}))
}));

describe('Filters', () => {
  let wrapper;

  const onDateChangeMock = jest.fn();

  beforeEach(() => {
    wrapper = shallow(
      <Filters
        onDateChange={onDateChangeMock}
        filterValues={{
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
