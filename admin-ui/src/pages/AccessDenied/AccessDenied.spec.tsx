import React from 'react';
import AccessDenied from './AccessDenied';
import { shallow } from 'enzyme';
import Circle from '../../components/Shape/Circle/Circle';

describe('AccessDenied', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<AccessDenied />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.find('h1').text()).toBe('Higher access level required');
    expect(wrapper.exists(Circle)).toBeTruthy();
  });
});
