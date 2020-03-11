import React from 'react';
import ConfirmationModal from './ConfirmationModal';
import HorizontalBar from '../Layout/HorizontalBar/HorizontalBar';
import { shallow } from 'enzyme';
import TextInput from '../Form/TextInput/TextInput';

jest.mock('../../hooks/useInput', () => {
  // First time form will not be valid, second time it will be
  const isValid = jest.fn();
  isValid.mockReturnValueOnce(false);
  isValid.mockReturnValueOnce(true);

  return jest.fn(() => ({
    value: 'someValue',
    isValid,
    onChange() {},
    error: ''
  }));
});

const mockOnClose = jest.fn();
const mockOnAction = jest.fn();

describe('ConfirmationModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <ConfirmationModal
        title="Modal"
        message="Message"
        onClose={mockOnClose}
        onAction={mockOnAction}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('works with default props', () => {
    expect(wrapper.exists(HorizontalBar)).toBeTruthy();
    expect(wrapper.find('.title').text()).toBe('Modal');
    expect(wrapper.find('.message').text()).toBe('Message');
    expect(wrapper.exists({ label: 'YES' })).toBeTruthy();
    expect(wrapper.exists('.bg')).toBeTruthy();
  });

  it('calls onClose callback function', () => {
    wrapper.find({ label: 'CANCEL' }).simulate('click');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('do not call onAction callback function when form is invalid', () => {
    wrapper.find({ label: 'YES' }).simulate('click');

    expect(mockOnAction).toHaveBeenCalledTimes(0);
  });

  it('calls onAction callback function when form is valid', () => {
    wrapper
      .find(TextInput)
      .dive()
      .find('textarea')
      .simulate('change', { target: { value: 'some-message' } });

    wrapper.find({ label: 'YES' }).simulate('click');
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });
});
