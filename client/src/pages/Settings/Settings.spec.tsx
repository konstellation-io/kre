import React from 'react';
import Cookies from 'js-cookie'
import { render, fireEvent, cleanup, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Router } from 'react-router-dom'
import * as ROUTE from '../../constants/routes';
import {Routes} from '../../App';
import { createMemoryHistory, History } from 'history'
import {GET_EXPIRATION_TIME} from './GeneralSettings';
import {GET_DOMAINS} from '../../components/DomainList/DomainList';
import {GET_USERS_ACTIVITY} from '../../components/UserActivityList/UserActivityList';
import '@testing-library/jest-dom/extend-expect';

import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

const mocks = [
  {
    request: {
      query: GET_EXPIRATION_TIME,
    },
    result: {
      data: {
        getCookieExpirationTime: 45,
      }
    },
  },
  {
    request: {
      query: GET_DOMAINS,
    },
    result: {
      data: {
        domains: [
          {name: 'domain.1'},
          {name: 'domain.2'},
          {name: 'domain.3.sample'},
        ],
      },
    },
  },
  {
    request: {
      query: GET_USERS_ACTIVITY,
    },
    result: {
      data: {
        usersActivity: [
          {user: 'user1@domain.com', message: 'some message 1', date: '2019-01-01'},
          {user: 'user2@domain.com', message: 'some message 2', date: '2019-01-02'},
          {user: 'user3@domain.com', message: 'some message 3', date: '2019-01-03'},
        ],
      },
    },
  },
];

Cookies.get = jest.fn().mockImplementationOnce(() => '');
// @ts-ignore
Cookies.get.mockImplementation(() => '123456');

afterEach(cleanup);

function generateComponent() {
  const history = createMemoryHistory();
  history.push(ROUTE.SETTINGS);

  const wrapper = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <Router history={history}>
          <Routes />
        </Router>
      </MemoryRouter>
    </MockedProvider>
  );

  return [wrapper, history];
}

it('Renders Settings without crashing', () => {
  const {container} = generateComponent()[0] as RenderResult;
  expect(container).toMatchSnapshot();
});

it('Shows general settings by default', () => {
  const {getByText} = generateComponent()[0] as RenderResult;

  expect(getByText('GENERAL')).toBeInTheDocument();
});

test('General settings show right texts',async () => {
  const {getByText, getByTestId} = generateComponent()[0] as RenderResult;

  await act(async () => {
    await wait(0);
  });

  expect(getByText('SAVE CHANGES')).toBeInTheDocument();
  expect(getByTestId('input')).toBeInTheDocument();
  // @ts-ignore
  expect(getByTestId('input').value).toBe('45');
});

it('can move to other settings', () => {
  const {container, getByText} = generateComponent()[0] as RenderResult;

  fireEvent.click(container, getByText('SECURITY'));
  expect(getByText('SECURITY')).toBeInTheDocument();
  
  fireEvent.click(container, getByText('AUDIT'));
  expect(getByText('AUDIT')).toBeInTheDocument();
});

test('General settings handles input changes', async () => {
  const {getByText, getByTestId} = generateComponent()[0] as RenderResult;

  await act(async () => {
    await wait(0);
  });

  fireEvent.change(getByTestId('input'), { target: { value: '0' } });
  fireEvent.click(getByText('SAVE CHANGES'));

  expect(getByTestId('error-message').textContent).not.toBe('');

  fireEvent.change(getByTestId('input'), { target: { value: '10' } });
  fireEvent.click(getByText('SAVE CHANGES'));

  expect(getByTestId('error-message').textContent).toBe('');
});

test('Security settings works properly', async () => {
  const [{getByText, getByTestId}, history] = generateComponent() as [RenderResult, History];

  history.push(ROUTE.SETTINGS_SECURITY);

  await act(async () => {
    await wait(0);
  });

  expect(getByText('Security settings')).toBeInTheDocument();
  expect(getByText('domain.1')).toBeInTheDocument();

  fireEvent.change(getByTestId('input'), { target: { value: 'intelygenz' } });
  fireEvent.click(getByText('ADD DOMAIN'));

  expect(getByTestId('error-message').textContent).not.toBe('');

  fireEvent.change(getByTestId('input'), { target: { value: 'intelygenz.com' } });
  fireEvent.click(getByText('ADD DOMAIN'));
});

test('Audit settings works properly', async () => {
  const [{getByText, getByTestId, queryByTestId}, history] = generateComponent() as [RenderResult, History];

  history.push(ROUTE.SETTINGS_AUDIT);

  await act(async () => {
    await wait(0);
  });

  expect(getByText('Audit. User History.')).toBeInTheDocument();
  expect(getByText('user1@domain.com')).toBeInTheDocument();

  fireEvent.change(getByTestId('input'), { target: { value: 'user1' } });
  fireEvent.click(getByText('SEARCH'));

  expect(getByTestId('error-message').textContent).toBe('');
  expect(queryByTestId('user2@domain.com')).toBeNull();
});
