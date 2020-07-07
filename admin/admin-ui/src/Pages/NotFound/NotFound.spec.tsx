import Circle from 'Components/Shape/Circle/Circle';
import NotFound from './NotFound';
import React from 'react';
import { shallow } from 'enzyme';

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
