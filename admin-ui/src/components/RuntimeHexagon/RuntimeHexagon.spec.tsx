import React from 'react';
import RuntimeHexagon from './RuntimeHexagon';
import { runtime } from '../../mocks/version';
import { shallow } from 'enzyme';

describe('RuntimeHexagon', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<RuntimeHexagon size={20} runtime={runtime} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.exists('.hexagon')).toBeTruthy();
  });

  it('has right size', () => {
    expect(wrapper.find('.wrapper').prop('style').height).toBe(20);
    expect(wrapper.find('.wrapper').prop('style').width).toBe(20);
  });
});
