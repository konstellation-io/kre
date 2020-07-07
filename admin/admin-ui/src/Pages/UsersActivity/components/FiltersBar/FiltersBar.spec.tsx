import FiltersBar from './FiltersBar';
import React from 'react';
import { shallow } from 'enzyme';

jest.mock('@apollo/react-hooks', () => ({
  useQuery: jest.fn(() => ({}))
}));

describe('FiltersBar', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(
      <FiltersBar
        onSubmit={jest.fn()}
        types={['a', 'b', 'c']}
        users={['1', '2', '3']}
        runtimesAndVersions={[]}
        errors={{}}
        watch={jest.fn()}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
