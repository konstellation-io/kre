import React from 'react';
import NotFound from './NotFound';
import { shallow } from 'enzyme';
import StateCircle from '../../components/Shape/StateCircle/StateCircle';

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
    expect(wrapper.exists(StateCircle)).toBeTruthy();
  });
});
