import React from 'react';
import { shallow } from 'enzyme';
import FiltersBar from './FiltersBar';

describe('FiltersBar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <FiltersBar
        form={{
          input: {
            type: { onChange: jest.fn() },
            userEmail: { onChange: jest.fn() },
            fromDate: { onChange: jest.fn() },
            toDate: { onChange: jest.fn() }
          }
        }}
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
