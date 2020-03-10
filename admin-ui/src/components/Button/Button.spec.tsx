import React from 'react';
import { cleanup } from '@testing-library/react';
import Button from './Button';
import { shallow } from 'enzyme';
import SpinnerLinear from '../LoadingComponents/SpinnerLinear/SpinnerLinear';
import { Link } from 'react-router-dom';

afterEach(cleanup);

describe('Button', () => {
  let wrapper;
  const mockClick = jest.fn(() => true);

  beforeEach(() => {
    wrapper = shallow(<Button onClick={mockClick} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('Shows right texts', () => {
    expect(wrapper.text()).toBe('Button');

    wrapper.setProps({ label: 'New Text' });
    expect(wrapper.text()).toBe('New Text');

    wrapper.setProps({
      label: 'Other Text',
      type: 'dark',
      onClick: function() {},
      primary: true,
      disabled: true
    });
    expect(wrapper.text()).toBe('Other Text');
  });

  it('Handles click events', () => {
    wrapper.simulate('click');

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('shows loader when loading', () => {
    wrapper.setProps({ loading: true });

    expect(wrapper.exists(SpinnerLinear)).toBeTruthy();
  });

  it('is a route button when a path is given', () => {
    const route = '/login/:someParam';

    wrapper.setProps({ to: route });
    expect(wrapper.find(Link).prop('to')).toBe(route);
  });
});
