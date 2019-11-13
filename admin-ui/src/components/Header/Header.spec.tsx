import React from 'react';
import { render } from '@testing-library/react';
import Header from './Header';

it('Render Header without crashing', () => {
  const { container } = render(<Header />);
  expect(container).toMatchSnapshot();
});
