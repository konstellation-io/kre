import React from 'react';
import TextInput from './TextInput';
import { shallow } from 'enzyme';
import { testid } from '../../../utils/testUtilsEnzyme';
import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';

const getInput = wrapper => wrapper.find(testid('input'));
const getLabel = wrapper => wrapper.find(InputLabel);

function checkTexts(
  wrapper: HTMLElement,
  inputText: string,
  labelText: string,
  placeholderText: string = ''
) {
  const input = getInput(wrapper);
  const label = getLabel(wrapper);

  expect(input.text()).toBe(inputText);
  expect(label.prop('text')).toBe(labelText);

  if (placeholderText) {
    expect(input.prop('placeholder')).toBe(placeholderText);
  }
}

describe('TextInput', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<TextInput />);
  });

  it('shows right texts', () => {
    checkTexts(wrapper, '', '');

    wrapper.setProps({ label: 'New Text', placeholder: 'New Placeholder' });
    checkTexts(wrapper, '', 'New Text', 'New Placeholder');

    wrapper.setProps({
      label: 'New Text 2',
      placeholder: 'New Placeholder 2',
      textArea: true
    });

    checkTexts(wrapper, '', 'New Text 2', 'New Placeholder 2');
  });

  it('shows error messages', () => {
    wrapper.setProps({ error: 'Some error' });

    expect(wrapper.find(InputError).prop('message')).toBe('Some error');
  });
});
