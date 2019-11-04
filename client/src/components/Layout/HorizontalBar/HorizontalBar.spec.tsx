import React from 'react';
import { render, cleanup } from '@testing-library/react';
import HorizontalBar from './HorizontalBar';
import '@testing-library/jest-dom/extend-expect';


afterEach(cleanup);

it('Renders HorizontalBar without crashing', () => {
  const { container } = render(<HorizontalBar>
    <div>A</div>
    <div>B</div>
    <div>C</div>
  </HorizontalBar>);
  expect(container).toMatchSnapshot();
});

it('Shows children components', () => {
  const { getByText } = render(<HorizontalBar>
    <div>A</div>
    <div>B</div>
    <div>C</div>
  </HorizontalBar>);

  expect(getByText('A')).toBeInTheDocument();
  expect(getByText('B')).toBeInTheDocument();
  expect(getByText('C')).toBeInTheDocument();
});
