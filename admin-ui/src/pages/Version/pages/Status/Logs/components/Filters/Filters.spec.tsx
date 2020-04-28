import React from 'react';
import Filters, { Filter } from './Filters';
import { shallow } from 'enzyme';

describe('Filters', () => {
  let wrapper;

  const onDateChangeMock = jest.fn();

  beforeEach(() => {
    wrapper = shallow(
      <Filters
        filters={{ filter: 'value' }}
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

  it('show right components', () => {
    expect(wrapper.exists('.title')).toBeTruthy();
    expect(wrapper.find(Filter).length).toBe(1);
  });

  it('can have multiple filters', () => {
    wrapper.setProps({
      filters: { filter1: 'value1', filter2: 'value2', filter3: 'value3' }
    });

    expect(wrapper.exists('.title')).toBeTruthy();
    expect(wrapper.find(Filter).length).toBe(3);
  });
});
