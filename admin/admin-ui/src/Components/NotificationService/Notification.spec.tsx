import { Button } from 'kwc';
import Notification from './Notification';
import { NotificationType } from 'Graphql/client/models/Notification';
import React from 'react';
import { shallow } from 'enzyme';

jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [jest.fn()])
}));
jest.mock('Graphql/client/cache', () => ({}));

describe('Notification', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(
      <Notification
        id="some id"
        message="some message"
        buttonLabel="some label"
        type={NotificationType.MESSAGE}
        to="some/other/route"
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

  it('do not show redirection button when there is no "to" prop', () => {
    wrapper.setProps({ to: '' });
    expect(wrapper.find(Button).length).toBe(1);
  });
});
