import * as MOCK from 'Mocks/settings';

import { History, createMemoryHistory } from 'history';
import { RenderResult, cleanup, fireEvent } from '@testing-library/react';

import { MockedProvider } from '@apollo/client/testing';
import ROUTE from 'Constants/routes';
import React from 'react';
import { Router } from 'react-router-dom';
import Settings from './Settings';
import { act } from 'react-dom/test-utils';
import { dashboardMock } from 'Mocks/runtime';
import { renderWithRouter } from 'Utils/testUtils';
import { usernameMock } from 'Mocks/auth';
import wait from 'waait';

const mocks = [
  MOCK.expirationTimeMock,
  MOCK.domainMock,
  MOCK.usersActivityMock,
  MOCK.addAllowedDomainMock,
  MOCK.updateExpirationTime,
  dashboardMock,
  usernameMock
];

afterEach(cleanup);

function generateComponent() {
  const history = createMemoryHistory();
  history.push(ROUTE.SETTINGS);

  const wrapper = renderWithRouter(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router history={history}>
        <Settings />
        {/* <Routes /> */}
      </Router>
    </MockedProvider>
  );

  return [wrapper.element, history];
}

it('Renders Settings without crashing', () => {
  const { container } = generateComponent()[0] as RenderResult;
  expect(container).toMatchSnapshot();
});

it('Shows general settings by default', async () => {
  const { getByText } = generateComponent()[0] as RenderResult;

  await act(async () => {
    await wait(0);
  });

  expect(getByText('GENERAL')).toBeInTheDocument();
});

it('can move to other settings', async () => {
  const { container, getByText } = generateComponent()[0] as RenderResult;

  await act(async () => {
    await wait(0);
  });

  fireEvent.click(container, getByText('SECURITY'));
  expect(getByText('SECURITY')).toBeInTheDocument();

  fireEvent.click(container, getByText('GENERAL'));
  expect(getByText('GENERAL')).toBeInTheDocument();
});

// FIXME: Research how to mock react-hook-form properly in order to trigger errors
it.skip('Security settings works properly', async () => {
  const [{ getByText, getByTestId }, history] = generateComponent() as [
    RenderResult,
    History
  ];

  history.push(ROUTE.SETTINGS_SECURITY);

  await act(async () => {
    await wait(0);
  });

  expect(getByText('Security settings')).toBeInTheDocument();
  expect(getByText('domain.1')).toBeInTheDocument();

  fireEvent.change(getByTestId('input'), { target: { value: 'intelygenz' } });
  fireEvent.click(getByText('ADD DOMAIN'));

  expect(getByTestId('error-message').textContent).not.toBe('');

  fireEvent.change(getByTestId('input'), {
    target: { value: 'intelygenz.com' }
  });
  fireEvent.click(getByText('ADD DOMAIN'));

  await act(async () => {
    await wait(0);
  });
  expect(getByText('intelygenz.com')).toBeInTheDocument();
});
