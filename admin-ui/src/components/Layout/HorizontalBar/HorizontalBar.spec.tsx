import React from 'react';
import HorizontalBar from './HorizontalBar';
import { shallow } from 'enzyme';

describe('HorizontalBar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <HorizontalBar>
        <div className="childrenA">A</div>
        <div className="childrenB">B</div>
        <div className="childrenC">C</div>
      </HorizontalBar>
    );
  });

  it('shows children components', () => {
    expect(wrapper.exists('.childrenA')).toBeTruthy();
    expect(wrapper.exists('.childrenB')).toBeTruthy();
    expect(wrapper.exists('.childrenC')).toBeTruthy();
  });
});
