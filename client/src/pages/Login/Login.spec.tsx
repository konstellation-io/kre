import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect'
import Login from './Login';
import * as CHECK from '../../components/Form/check';

afterEach(cleanup);

const getInput = (c:HTMLElement) => getByTestId(c, 'email-input') as HTMLInputElement;
const getError = (c:HTMLElement) => getByTestId(c, 'error-message');

it('Render Login without crashing', () => {
  const { container } = render(<Login />);
  expect(container).toMatchSnapshot();
});

it('Shows correct texts', () => {
  const { getByText } = render(<Login />);

  expect(getByText('write your login credentials')).toBeInTheDocument();
  expect(getByText('EMAIL')).toBeInTheDocument();
  expect(getByText('SAVE')).toBeInTheDocument();
});

it('shows an error on summiting an invalid adress', () => {
  const { getByText, container } = render(<Login />);
  const invalidEmail = 'invalid@email';
  const input = getInput(container);

  fireEvent.change(input, { target: { value: invalidEmail } });

  expect(input.value).toBe(invalidEmail);

  fireEvent.click(getByText('SAVE'));

  const error = getError(container);

  expect(error.textContent).toBe(CHECK.isEmailNotValid(invalidEmail));
});

it('shows performs a login request', () => {
  const { getByText, container } = render(<Login />);
  const validEmail = 'valid@email.es';
  const input = getInput(container);

  fireEvent.change(input, { target: { value: validEmail } });

  expect(input.value).toBe(validEmail);

  fireEvent.click(getByText('SAVE'));

  const error = getError(container);
  expect(error.textContent).toBe('');
});
