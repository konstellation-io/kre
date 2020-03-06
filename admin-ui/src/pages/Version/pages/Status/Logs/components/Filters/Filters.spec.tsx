import React from 'react';
import Filters, { Filter } from './Filters';
import { shallow } from 'enzyme';

it('show right components', () => {
  const wrapper = shallow(<Filters filters={{ filter: 'value' }} />);

  expect(wrapper.exists('.title')).toBeTruthy();
  expect(wrapper.find(Filter).length).toBe(1);
});

it('can have multiple filters', () => {
  const wrapper = shallow(
    <Filters
      filters={{ filter1: 'value1', filter2: 'value2', filter3: 'value3' }}
    />
  );

  expect(wrapper.exists('.title')).toBeTruthy();
  expect(wrapper.find(Filter).length).toBe(3);
});
