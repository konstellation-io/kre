import React from 'react';
import Login from './Login';
import * as CHECK from '../../components/Form/check';
import axios from 'axios';
import { shallow } from 'enzyme';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import InputError from '../../components/Form/InputError/InputError';

jest.mock('axios');

const getInput = wrapper =>
  wrapper
    .find(TextInput)
    .dive()
    .find('input');
const getError = wrapper =>
  wrapper
    .find(TextInput)
    .dive()
    .find(InputError);

jest.mock('react-router');
jest.mock('history');

describe('Login', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Login />);
  });

  it('shows right components', () => {
    expect(wrapper.find('h1').length).toBe(2);
    expect(wrapper.exists(TextInput)).toBeTruthy();
    expect(wrapper.exists(Button)).toBeTruthy();
  });

  it('shows an error on summiting an invalid adress', () => {
    getInput(wrapper).simulate('change', {
      target: { value: 'invalid@email' }
    });
    wrapper.find(Button).simulate('click');

    expect(getError(wrapper).prop('message')).toBe(
      CHECK.isEmailValid('invalid@email').message
    );
  });

  it('performs a login request', async () => {
    axios.mockResolvedValue({
      data: { message: 'Email sent to the user' },
      status: 200
    });

    getInput(wrapper).simulate('change', {
      target: { value: 'valid@email.es' }
    });
    wrapper.find(Button).simulate('click');

    expect(getError(wrapper).prop('message')).toBe('');
  });
});
