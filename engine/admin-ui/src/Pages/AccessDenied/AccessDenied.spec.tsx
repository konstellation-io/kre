import AccessDenied from './AccessDenied';
import Circle from 'Components/Shape/Circle/Circle';
import React from 'react';
import { shallow } from 'enzyme';

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
