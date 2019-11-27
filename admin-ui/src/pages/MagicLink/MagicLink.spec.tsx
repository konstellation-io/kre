import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, cleanup, act } from '@testing-library/react';
import MagicLink from './MagicLink';
import * as PAGES from '../../constants/routes';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';

jest.mock('axios');

afterEach(cleanup);

const magicLinkWithTokenPath = PAGES.MAGIC_LINK.replace(':token', '123456');

function renderComponent(locationPath: string) {
  const history = createMemoryHistory();
  history.push(locationPath);

  return render(
    <Router history={history}>
      <Route exact path={PAGES.MAGIC_LINK}>
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
