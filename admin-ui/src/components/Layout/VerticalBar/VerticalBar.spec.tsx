import React from 'react';
import VerticalBar from './VerticalBar';
import { shallow } from 'enzyme';

describe('VerticalBar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <VerticalBar>
        <div className="childrenA">A</div>
        <div className="childrenB">B</div>
        <div className="childrenC">C</div>
      </VerticalBar>
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('shows children components', () => {
    expect(wrapper.exists('.childrenA')).toBeTruthy();
    expect(wrapper.exists('.childrenB')).toBeTruthy();
    expect(wrapper.exists('.childrenC')).toBeTruthy();
  });
});
