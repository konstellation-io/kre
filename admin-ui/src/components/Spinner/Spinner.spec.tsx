import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { getByTestId } from '@testing-library/dom';
import Spinner from './Spinner';
import '@testing-library/jest-dom/extend-expect';

afterEach(cleanup);

it('Render Spinner without crashing', () => {
  const { container } = render(<Spinner />);
  expect(container).toMatchSnapshot();

  expect(getByTestId(container, 'spinner-planet')).toBeInTheDocument();
});
