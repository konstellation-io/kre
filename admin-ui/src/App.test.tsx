import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ReactDOM from 'react-dom';
import App, { Routes } from './App';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';

import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import { dashboardMock } from './mocks/runtime';
import { usernameMock, unauthorizedUsernameMock } from './mocks/auth';

const mocks = [dashboardMock, usernameMock];
const mocksUnauthorizedUser = [dashboardMock, unauthorizedUsernameMock];

afterEach(cleanup);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </MockedProvider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});

// I cannot test login redirection, redirection logic is located inside Apollo client config,
// But I can check for apollo errors when making a request
it('it shows spash screen when user is not logged in', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocksUnauthorizedUser} addTypename={false}>
      <MemoryRouter>
        <Routes />
      </MemoryRouter>
    </MockedProvider>
  );

  await act(async () => {
    await wait(0);
  });

  expect(getByTestId('splashscreen')).toBeInTheDocument();
});

it('it shows dashboard page on home URL when logged', () => {
  const { getByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <Routes />
      </MemoryRouter>
    </MockedProvider>
  );

  expect(getByTestId('dashboardContainer')).toBeInTheDocument();
});
