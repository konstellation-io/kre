import React from 'react';
import { shallow } from 'enzyme';
import FiltersBar from './FiltersBar';

describe('FiltersBar', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(
      <FiltersBar
        onSubmit={jest.fn()}
        types={['a', 'b', 'c']}
        users={['1', '2', '3']}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
