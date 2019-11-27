import React from 'react';
import { renderWithReduxAndRouter } from './utils/testUtils';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ReactDOM from 'react-dom';
import { HOME } from './constants/routes';
import App, { Routes } from './App';
import { act } from 'react-dom/test-utils';

import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import { dashboardMock } from './mocks/runtime';
import { usernameMock, unauthorizedUsernameMock } from './mocks/auth';

const mocks = [dashboardMock, usernameMock];
const mocksUnauthorizedUser = [dashboardMock, unauthorizedUsernameMock];

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
