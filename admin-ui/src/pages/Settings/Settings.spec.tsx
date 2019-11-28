import React from 'react';
import { renderWithReduxAndRouter } from '../../utils/testUtils';
import { fireEvent, cleanup, RenderResult } from '@testing-library/react';
import { Router } from 'react-router-dom';
import * as ROUTE from '../../constants/routes';
import { Routes } from '../../App';
import { createMemoryHistory, History } from 'history';

import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

import * as MOCK from '../../mocks/settings';
import { usernameMock } from '../../mocks/auth';

const mocks = [
  MOCK.expirationTimeMock,
  MOCK.domainMock,
  MOCK.usersActivityMock,
  MOCK.addAllowedDomainMock,
  MOCK.updateExpirationTime,
  usernameMock
];

afterEach(cleanup);

function generateComponent() {
  const history = createMemoryHistory();
  history.push(ROUTE.SETTINGS);

  const wrapper = renderWithReduxAndRouter(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router history={history}>
        <Routes />
      </Router>
    </MockedProvider>
  );

  return [wrapper.element, history];
}

it('Renders Settings without crashing', () => {
  const { container } = generateComponent()[0] as RenderResult;
  expect(container).toMatchSnapshot();
});

it('Shows general settings by default', () => {
  const { getByText } = generateComponent()[0] as RenderResult;

  expect(getByText('GENERAL')).toBeInTheDocument();
});

test('General settings show right texts', async () => {
  const { getByText, getByTestId } = generateComponent()[0] as RenderResult;

  await act(async () => {
    await wait(0);
  });

  expect(getByText('SAVE CHANGES')).toBeInTheDocument();
  expect(getByTestId('input')).toBeInTheDocument();
  // @ts-ignore
  expect(getByTestId('input').value).toBe('45');
});

it('can move to other settings', () => {
  const { container, getByText } = generateComponent()[0] as RenderResult;

  fireEvent.click(container, getByText('SECURITY'));
  expect(getByText('SECURITY')).toBeInTheDocument();

  fireEvent.click(container, getByText('AUDIT'));
  expect(getByText('AUDIT')).toBeInTheDocument();
});

test('General settings handles input changes', async () => {
  const { getByText, getByTestId } = generateComponent()[0] as RenderResult;

  await act(async () => {
    await wait(0);
  });

  fireEvent.change(getByTestId('input'), { target: { value: '0' } });
  fireEvent.click(getByText('SAVE CHANGES'));

  expect(getByTestId('error-message').textContent).not.toBe('');

  fireEvent.change(getByTestId('input'), { target: { value: '10' } });
  fireEvent.click(getByText('SAVE CHANGES'));

  await act(async () => {
    await wait(0);
  });

  expect(getByTestId('error-message').textContent).toBe('');
});

test('Security settings works properly', async () => {
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

  expect(getByTestId('error-message').textContent).toBe('');
  expect(getByText('intelygenz.com')).toBeInTheDocument();
});

test('Audit settings works properly', async () => {
  const [
    { getByText, getByTestId, queryByTestId },
    history
  ] = generateComponent() as [RenderResult, History];

  history.push(ROUTE.SETTINGS_AUDIT);

  await act(async () => {
    await wait(0);
  });

  expect(getByText('Audit. User History.')).toBeInTheDocument();
  expect(getByText('user1@domain.com')).toBeInTheDocument();

  fireEvent.change(getByTestId('input'), { target: { value: 'user1' } });
  fireEvent.click(getByText('SEARCH'));

  await act(async () => {
    await wait(0);
  });

  expect(getByTestId('error-message').textContent).toBe('');
  expect(queryByTestId('user2@domain.com')).toBeNull();
});
