import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ReactDOM from 'react-dom';
import App from './App';
import '@testing-library/jest-dom/extend-expect'
import * as ROUTE from './constants/routes';

afterEach(cleanup);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('it shows login page on home URL', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={[ ROUTE.HOME ]}>
      <App />
    </MemoryRouter>
  );
  
  expect(getByText('Send me a login link')).toBeInTheDocument();
});
