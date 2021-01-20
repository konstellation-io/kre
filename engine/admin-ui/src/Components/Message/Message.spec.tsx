import Message from './Message';
import React from 'react';
import { shallow } from 'enzyme';

describe('Message', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = shallow(<Message text="Some text" />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right text', () => {
    expect(wrapper.text()).toBe('Some text');
  });
});
