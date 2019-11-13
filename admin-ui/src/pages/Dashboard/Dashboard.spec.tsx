import React from 'react';
import { MemoryRouter } from 'react-router';
import { render, cleanup } from '@testing-library/react';
import Dashboard from './Dashboard';
import '@testing-library/jest-dom/extend-expect';

import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

import { dashboardMock } from '../../mocks/runtime';

const mocks = [dashboardMock];

const Component = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  </MockedProvider>
);

afterEach(cleanup);

it('Render Dashboard without crashing', () => {
  const { container } = render(Component);

  expect(container).toMatchSnapshot();
});

it('Shows right texts', async () => {
  const { getByText, getAllByText } = render(Component);

  await act(async () => {
    await wait(0);
  });

  expect(getByText('Some Name')).not.toBeNull();
  expect(getByText('00002')).not.toBeNull();
  expect(getByText('some message')).not.toBeNull();
  expect(getAllByText('ERROR')).not.toBeNull();
});
