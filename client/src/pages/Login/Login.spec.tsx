import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect'
import Login from './Login';
import * as CHECK from '../../components/Form/check';
import axios from 'axios';

jest.mock('axios');

afterEach(cleanup);

const getInput = (c:HTMLElement) => getByTestId(c, 'email-input') as HTMLInputElement;
const getError = (c:HTMLElement) => getByTestId(c, 'error-message');

it('Render Login without crashing', () => {
  const { container } = render(<Login history/>);
  expect(container).toMatchSnapshot();
});

it('Shows correct texts', () => {
  const { getByText } = render(<Login history/>);

  expect(getByText('enter your email address')).toBeInTheDocument();
  expect(getByText('EMAIL')).toBeInTheDocument();
  expect(getByText('Send me a login link')).toBeInTheDocument();
});

it('shows an error on summiting an invalid adress', () => {
  const { getByText, container } = render(<Login history/>);
  const invalidEmail = 'invalid@email';
  const input = getInput(container);

  fireEvent.change(input, { target: { value: invalidEmail } });

  expect(input.value).toBe(invalidEmail);

  fireEvent.click(getByText('Send me a login link'));

  const error = getError(container);

  expect(error.textContent).toBe(CHECK.isEmailNotValid(invalidEmail));
});


it('performs a login request', async () => {
  // @ts-ignore
  axios.mockResolvedValue({ data: 'OK' });

  const history = createMemoryHistory();
  const { getByText, container } = render(
    <Router history={history}>
      <Login history={history} />
    </Router>
  );
  const validEmail = 'valid@email.es';
  const input = getInput(container);

  fireEvent.change(input, { target: { value: validEmail } });
  expect(input.value).toBe(validEmail);
  
  // Success response
  await act(async () => {
    await fireEvent.click(getByText('Send me a login link'));
  });
  
  let error = getError(container);
  expect(error.textContent).toBe('');

  // @ts-ignore
  axios.mockRejectedValue('not-allowed');

  // Failure response
  await act(async () => {
    await fireEvent.click(getByText('Send me a login link'));
  });
  
  error = getError(container);
  expect(error.textContent).toBe('Unexpected error. Contact support for more information');
});
