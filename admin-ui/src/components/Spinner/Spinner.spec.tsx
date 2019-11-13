import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import Spinner from './Spinner';

afterEach(cleanup);

it('Render Spinner without crashing', () => {
  const { container } = render(<Spinner />);
  expect(container).toMatchSnapshot();

  expect(getByTestId(container, 'spinner-planet')).toBeInTheDocument();
});
