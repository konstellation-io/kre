import React from 'react';
import Cookies from 'js-cookie'
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ReactDOM from 'react-dom';
import App, { Routes } from './App';
import '@testing-library/jest-dom/extend-expect';

import { MockedProvider } from '@apollo/react-testing';
import { runtimeMock } from './mocks/runtime';

const mocks = [
  runtimeMock
];

Cookies.get = jest.fn().mockImplementationOnce(() => '');

afterEach(cleanup);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><App /></MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});

// @ts-ignore
Cookies.get.mockImplementationOnce(() => '');
it('it shows login page on home URL', () => {
  const { getByText }= render(
    <MemoryRouter><Routes /></MemoryRouter>
  );

  expect(getByText('SEND ME A LOGIN LINK')).toBeInTheDocument();
});

// @ts-ignore
Cookies.get.mockImplementationOnce(() => '123456');
it('it shows dashboard page on home URL when logged', () => {
  const { getByTestId }= render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter><Routes /></MemoryRouter>
    </MockedProvider>
  );

  expect(getByTestId('dashboardContainer')).toBeInTheDocument();
});
