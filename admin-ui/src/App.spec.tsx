import React from 'react';
import { renderWithReduxAndRouter } from './utils/testUtils';
import { cleanup } from '@testing-library/react';
import { HOME } from './constants/routes';
import App, { Routes } from './App';

import { MockedProvider } from '@apollo/react-testing';
import { dashboardMock } from './mocks/runtime';
import { usernameMock } from './mocks/auth';

const mocks = [dashboardMock, usernameMock];

afterEach(cleanup);

it('renders without crashing', () => {
  const {
    element: { container }
  } = renderWithReduxAndRouter(
    <MockedProvider mocks={mocks} addTypename={false}>
      <App />
    </MockedProvider>
  );
  expect(container).toMatchSnapshot();
});

it('it shows dashboard page on home URL when logged', () => {
  const {
    element: { getByTestId }
  } = renderWithReduxAndRouter(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Routes />
    </MockedProvider>,
    HOME
  );

  expect(getByTestId('dashboardContainer')).toBeInTheDocument();
});
