import React from 'react';
import { renderWithReduxAndRouter } from '../../utils/testUtils';
import { cleanup } from '@testing-library/react';
import Dashboard from './Dashboard';

import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

import { dashboardMock } from '../../mocks/runtime';
import { usernameMock } from '../../mocks/auth';

const mocks = [dashboardMock, usernameMock];

const Component = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Dashboard />
  </MockedProvider>
);

afterEach(cleanup);

it('Render Dashboard without crashing', () => {
  const {
    element: { container }
  } = renderWithReduxAndRouter(Component);

  expect(container).toMatchSnapshot();
});

// it('Shows right texts', async () => {
//   const {
//     element: { getByText, getAllByText }
//   } = renderWithReduxAndRouter(Component);

//   await act(async () => {
//     await wait(0);
//   });

//   expect(getByText('Some Name')).not.toBeNull();
//   expect(getByText('00002')).not.toBeNull();
//   expect(getByText('some message')).not.toBeNull();
//   expect(getAllByText('ERROR')).not.toBeNull();
// });
