import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, createLocation, Location } from 'history';
import { render, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import MagicLink from './MagicLink';
import * as PAGES from '../../constants/routes';
import axios from 'axios';

jest.mock('axios');

afterEach(cleanup);

function renderComponent(locationPath:string) {
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
  axios.mockResolvedValue({ data: 'OK' });
  const {container} = renderComponent('/magic_link/123456');

  expect(container).toMatchSnapshot();

  await act(async () => {});
});

it('handles success response', async () => {
  // @ts-ignore
  axios.mockResolvedValue({ data: 'OK' });
  const {getByText} = renderComponent('/magic_link/123456');

  // Wait for loading animation to finish
  await act(async () => {
    await new Promise((r) => setTimeout(r, 3000));
  });

  expect(getByText('You are connected!')).toBeInTheDocument();
});

it('handles error response', async () => {
  // @ts-ignore
  axios.mockRejectedValue({ data: 'ERROR' });
  const {getByText} = renderComponent('/magic_link/123456');

  // Wait for loading animation to finish
  await act(async () => {
    await new Promise((r) => setTimeout(r, 3000));
  });

  expect(getByText('Unexpected error. Contact support for more information')).toBeInTheDocument();
});
