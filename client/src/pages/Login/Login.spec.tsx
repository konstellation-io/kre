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

const getInput = (c:HTMLElement) => getByTestId(c, 'input') as HTMLInputElement;
const getError = (c:HTMLElement) => getByTestId(c, 'error-message');

it('Render Login without crashing', () => {
  const { container } = render(<Login history/>);
  expect(container).toMatchSnapshot();
});

it('Shows correct texts', () => {
  const { getByText } = render(<Login history/>);

  expect(getByText('enter your email address')).toBeInTheDocument();
  expect(getByText('EMAIL')).toBeInTheDocument();
  expect(getByText('SEND ME A LOGIN LINK')).toBeInTheDocument();
});

it('shows an error on summiting an invalid adress', () => {
  const { getByText, container } = render(<Login history/>);
  const invalidEmail = 'invalid@email';
  const input = getInput(container);

  fireEvent.change(input, { target: { value: invalidEmail } });

  expect(input.value).toBe(invalidEmail);

  fireEvent.click(getByText('SEND ME A LOGIN LINK'));

  const error = getError(container);

  expect(error.textContent).toBe(CHECK.isEmailValid(invalidEmail).message);
});


it('performs a login request', async () => {
  // @ts-ignore
  axios.mockResolvedValue({ data: {message: "Email sent to the user"}, status: 200});

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
    await fireEvent.click(getByText('SEND ME A LOGIN LINK'));
  });
  
  let error = getError(container);
  expect(error.textContent).toBe('');

  // @ts-ignore
  axios.mockRejectedValue({response: { data: {code: "error"}, status: 400}});

  // Failure response
  await act(async () => {
    await fireEvent.click(getByText('SEND ME A LOGIN LINK'));
  });
  
  error = getError(container);
  expect(error.textContent).toBe('Unexpected error. Contact support for more information');
});
