import React from 'react';
import NotFound from './NotFound';
import { shallow } from 'enzyme';
import Circle from '../../components/Shape/Circle/Circle';

describe('NotFound', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<NotFound />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.find('h1').text()).toBe('Page not found');
    expect(wrapper.exists(Circle)).toBeTruthy();
  });
});
