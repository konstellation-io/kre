import Button from '../Button/Button';
import Notification from './Notification';
import { NotificationType } from 'Graphql/client/typeDefs';
import React from 'react';
import { shallow } from 'enzyme';

jest.mock('@apollo/react-hooks', () => ({
  useMutation: jest.fn(() => [jest.fn()])
}));

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
