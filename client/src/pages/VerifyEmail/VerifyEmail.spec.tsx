import React from 'react';
import { render, cleanup } from '@testing-library/react';
import VerifyEmail from './VerifyEmail';
import '@testing-library/jest-dom/extend-expect'


afterEach(cleanup);

it('renders VerifyEmail without crashing', () => {
  const { container } = render(<VerifyEmail />);
  expect(container).toMatchSnapshot();
});

it('show correct texts', () => {
  const { getByText } = render(<VerifyEmail />);
  expect(getByText('Login link sent')).toBeInTheDocument();
});
