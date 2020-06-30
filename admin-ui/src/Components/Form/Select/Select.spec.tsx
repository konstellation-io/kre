import React from 'react';
import Select from './Select';
import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import { shallow } from 'enzyme';

const OPTIONS = ['Option A', 'Option B', 'Option C'];

const mockOnChange = jest.fn();

describe('Select', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(
      <Select
        label="Select"
        placeholder="placeholder"
        options={OPTIONS}
        onChange={mockOnChange}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.find(InputLabel).prop('text')).toBe('Select');
    expect(wrapper.find(InputError).prop('message')).toBe('');
    expect(
      wrapper
        .find('.optionElement')
        .at(0)
        .text()
    ).toBe('All');
    expect(wrapper.exists('.placeholder')).toBeTruthy();
    expect(wrapper.exists('.opened')).toBeFalsy();
  });

  it('show error message', () => {
    wrapper.setProps({ error: 'Some error' });

    expect(wrapper.find(InputError).prop('message')).toBe('Some error');
  });

  it('handles events', () => {
    wrapper.find('.input').simulate('click');
    expect(wrapper.exists('.opened')).toBeTruthy();

    wrapper
      .find('.optionElement')
      .at(1)
      .simulate('click');

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(OPTIONS[0]);
    expect(wrapper.exists('.opened')).toBeFalsy();
  });
});
