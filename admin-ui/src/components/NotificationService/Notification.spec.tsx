import React from 'react';
import Notification from './Notification';
import { shallow } from 'enzyme';
import { label } from '../../utils/testUtilsEnzyme';
import Button from '../Button/Button';

describe('Notification', () => {
  let wrapper;

  const mockOnAction = jest.fn();
  const mockOnClose = jest.fn();
  beforeEach(() => {
    wrapper = shallow(
      <Notification
        message="some message"
        buttonLabel="some label"
        onCloseNotification={mockOnClose}
        buttonAction={mockOnAction}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.find(Button).length).toBe(2);
    expect(wrapper.find('.message').text()).toBe('some message');
  });

  it('handles on close event', () => {
    wrapper
      .find(Button)
      .find(label(''))
      .simulate('click');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles on action event', () => {
    wrapper
      .find(Button)
      .find(label('some label'))
      .simulate('click');

    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });
});
