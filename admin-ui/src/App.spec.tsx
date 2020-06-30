// FIXME: reformat this to new test format

import App, { Routes } from 'App';

import { MockedProvider } from '@apollo/react-testing';
import ROUTE from 'Constants/routes';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { cleanup } from '@testing-library/react';
import { dashboardMock } from 'Mocks/runtime';
import { renderWithRouter } from 'Utils/testUtils';
import { usernameMock } from 'Mocks/auth';
import wait from 'waait';

const mocks = [dashboardMock, usernameMock];

afterEach(cleanup);

it('renders without crashing', () => {
  const {
    element: { container }
  } = renderWithRouter(
    <MockedProvider mocks={mocks} addTypename={false}>
      <App />
    </MockedProvider>
  );
  expect(container).toMatchSnapshot();
});

it('it shows dashboard page on home URL when logged', async () => {
  const {
    element: { getByTestId }
  } = renderWithRouter(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Routes />
    </MockedProvider>,
    ROUTE.HOME
  );

  await act(async () => {
    await wait(0);
  });

  expect(getByTestId('dashboardContainer')).toBeInTheDocument();
});
