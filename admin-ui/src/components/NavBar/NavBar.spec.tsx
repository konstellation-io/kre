import React from 'react';
import NavBar, { Tab } from './NavBar';
import { shallow } from 'enzyme';
import { NavLink } from 'react-router-dom';

const tabs = [
  { label: 'TAB 1', route: '/home' } as Tab,
  { label: 'TAB 2', route: '/home' } as Tab,
  { label: 'TAB 3', route: '/home' } as Tab
];

describe('NavBar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<NavBar tabs={tabs} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.exists(NavLink)).toBeTruthy();
    expect(wrapper.find(NavLink).length).toBe(3);
  });

  it('Shows different options', () => {
    expect(
      wrapper
        .find(NavLink)
        .at(0)
        .find('span')
        .text()
    ).toBe('TAB 1');
    expect(
      wrapper
        .find(NavLink)
        .at(1)
        .find('span')
        .text()
    ).toBe('TAB 2');
    expect(
      wrapper
        .find(NavLink)
        .at(2)
        .find('span')
        .text()
    ).toBe('TAB 3');
  });
});
