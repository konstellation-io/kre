import '@testing-library/jest-dom/extend-expect';

import { Route, Router } from 'react-router-dom';
import { act, cleanup, render } from '@testing-library/react';

import MagicLink from './MagicLink';
import ROUTE from 'Constants/routes';
import React from 'react';
import axios from 'axios';
import { createMemoryHistory } from 'history';

jest.mock('axios');

afterEach(cleanup);

const magicLinkWithTokenPath = ROUTE.MAGIC_LINK.replace(':token', '123456');

function renderComponent(locationPath: string) {
  const history = createMemoryHistory();
  history.push(locationPath);

  return render(
    <Router history={history}>
      <Route exact path={ROUTE.MAGIC_LINK}>
        <MagicLink history={history} />
      </Route>
    </Router>
  );
}

it('Render MagicLink without crashing', async () => {
  // @ts-ignore
  axios.mockResolvedValue({
    data: { message: 'Email sent to the user' },
    status: 200
  });
  const { container } = renderComponent(magicLinkWithTokenPath);

  expect(container).toMatchSnapshot();

  await act(async () => {});
});

it('handles success response', async () => {
  // @ts-ignore
  axios.mockResolvedValue({
    data: { message: 'Email sent to the user' },
    status: 200
  });
  const { getByText } = renderComponent(magicLinkWithTokenPath);

  // Wait for loading animation to finish
  await act(async () => {
    await new Promise(r => setTimeout(r, 3000));
  });

  expect(getByText('You are connected!')).toBeInTheDocument();
});

it('handles error response', async () => {
  // @ts-ignore
  axios.mockRejectedValue({
    response: { data: { code: 'error' }, status: 400 }
  });
  const { getByText } = renderComponent(magicLinkWithTokenPath);

  // Wait for loading animation to finish
  await act(async () => {
    await new Promise(r => setTimeout(r, 3000));
  });

  expect(
    getByText('Unexpected error. Contact support for more information')
  ).toBeInTheDocument();
});
