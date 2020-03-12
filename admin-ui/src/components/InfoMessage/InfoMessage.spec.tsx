import React from 'react';
import InfoMessage from './InfoMessage';
import { shallow } from 'enzyme';

describe('InfoMessage', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<InfoMessage message="some message" />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.find('.container').text()).toBe('some message');
  });
});
