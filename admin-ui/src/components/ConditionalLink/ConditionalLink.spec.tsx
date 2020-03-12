import React from 'react';
import ConditionalLink from './ConditionalLink';
import { Link, NavLink } from 'react-router-dom';
import { shallow } from 'enzyme';

describe('ConditionalLink', () => {
  const ROUTE = '/some-route/index';
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <ConditionalLink to={ROUTE}>
        <div>Sample text</div>
      </ConditionalLink>
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('shows right default values', () => {
    expect(wrapper.exists(Link)).toBeTruthy();
    expect(wrapper.text()).toBe('Sample text');
    expect(wrapper.find(Link).prop('to')).toBe(ROUTE);
  });

  it('shows right link type', () => {
    wrapper.setProps({ LinkType: NavLink });

    expect(wrapper.exists(NavLink)).toBeTruthy();
    expect(wrapper.text()).toBe('Sample text');
    expect(wrapper.find(NavLink).prop('to')).toBe(ROUTE);
  });

  it('do not show a link when disabled', () => {
    wrapper.setProps({ disabled: true });

    expect(wrapper.exists(Link)).toBeFalsy();
    expect(wrapper.text()).toBe('Sample text');
  });
});
