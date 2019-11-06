import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, createLocation } from 'history';
import { render, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import MagicLink, { getToken } from './MagicLink';
import axios from 'axios';

jest.mock('axios');

afterEach(cleanup);


function renderComponent(locationPath:string) {
  const history = createMemoryHistory();
  const location = createLocation(locationPath);

  return render(
    <Router history={history}>
      <MagicLink history={history} location={ location } />
    </Router>
  );
}

it('Render MagicLink without crashing', () => {
  const {container} = renderComponent('/magic_link');

  expect(container).toMatchSnapshot();
});

it('obtains token from location', () => {
  const location:any = createLocation('/magic_link?token=123456');
  const token = getToken(location);

  expect(token).toBe('123456');
});

it('handles success response', async () => {
  // @ts-ignore
  axios.mockResolvedValue({ data: 'OK' });
  const {getByText} = renderComponent('/magic_link?token=123456');

  // Wait for loading animation to finish
  await act(async () => {
    await new Promise((r) => setTimeout(r, 3000));
  });

  expect(getByText('You are connected!')).toBeInTheDocument();
});

it('handles error response', async () => {
  // @ts-ignore
  axios.mockRejectedValue({ data: 'ERROR' });
  const {getByText} = renderComponent('/magic_link?token=123456');

  // Wait for loading animation to finish
  await act(async () => {
    await new Promise((r) => setTimeout(r, 3000));
  });

  expect(getByText('Unexpected error. Contact support for more information')).toBeInTheDocument();
});
