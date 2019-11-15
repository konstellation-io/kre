import React from 'react';
import {
  render,
  fireEvent,
  cleanup,
  RenderResult
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Router } from 'react-router-dom';
import * as ROUTE from '../../constants/routes';
import { Routes } from '../../App';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';

import { MockedProvider } from '@apollo/react-testing';
import { usernameMock } from '../../mocks/auth';
import { addRuntimeMock, dashboardMock } from '../../mocks/runtime';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

const mocks = [addRuntimeMock, dashboardMock, usernameMock];

afterEach(cleanup);

function generateComponent() {
  const history = createMemoryHistory();
  history.push(ROUTE.NEW_RUNTIME);

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

it('Renders AddRuntime without crashing', () => {
  const { container } = generateComponent()[0] as RenderResult;
  expect(container).toMatchSnapshot();
});

test('Show right texts', async () => {
  const { getByText } = generateComponent()[0] as RenderResult;

  expect(getByText('Add Runtime')).toBeInTheDocument();
  expect(getByText('SAVE')).toBeInTheDocument();
});

it('Handles input changes', async () => {
  const { getByText, getByTestId } = generateComponent()[0] as RenderResult;

  fireEvent.change(getByTestId('input'), { target: { value: '' } });
  fireEvent.click(getByText('SAVE'));

  expect(getByTestId('error-message').textContent).not.toBe('');

  fireEvent.change(getByTestId('input'), { target: { value: 'New Runtime' } });
  fireEvent.click(getByText('SAVE'));

  await act(async () => {
    await wait(0);
  });

  expect(getByTestId('dashboardContainer')).toBeInTheDocument();
});
