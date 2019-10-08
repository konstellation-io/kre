import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, createLocation } from 'history';
import { render, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import MagicLink, { getToken } from './MagicLink';
import axios from 'axios';

jest.mock('axios');

afterEach(cleanup);


it('Render MagicLink without crashing', () => {
  const history = createMemoryHistory();
  const location = createLocation('/magic_link');
  const { container } = render(
    <Router history={history}>
      <MagicLink history={history} location={ location } />
    </Router>
  );
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

  const history = createMemoryHistory();
  const location = createLocation('/magic_link?token=123456');

  await act(async () => {
    await render(
      <Router history={history}>
        <MagicLink history={history} location={ location } />
      </Router>
    );
  });
});

it('handles error response', async () => {
  // @ts-ignore
  axios.mockRejectedValue({ data: 'ERROR' });

  let getByText = function(selector:string) {};
  const history = createMemoryHistory();
  const location = createLocation('/magic_link?token=123456');

  await act(async () => {
    ({ getByText } = await render(
      <Router history={history}>
        <MagicLink history={history} location={ location } />
      </Router>
    ));
  });

  expect(getByText('Unexpected error. Contact support for more information')).toBeInTheDocument();
});
