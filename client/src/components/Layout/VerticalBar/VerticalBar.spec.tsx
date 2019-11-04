import React from 'react';
import { render, cleanup } from '@testing-library/react';
import VerticalBar from './VerticalBar';
import '@testing-library/jest-dom/extend-expect';


afterEach(cleanup);

it('Renders VerticalBar without crashing', () => {
  const { container } = render(<VerticalBar>
    <div>A</div>
    <div>B</div>
    <div>C</div>
  </VerticalBar>);
  expect(container).toMatchSnapshot();
});

it('Shows children components', () => {
  const { getByText } = render(<VerticalBar>
    <div>A</div>
    <div>B</div>
    <div>C</div>
  </VerticalBar>);

  expect(getByText('A')).toBeInTheDocument();
  expect(getByText('B')).toBeInTheDocument();
  expect(getByText('C')).toBeInTheDocument();
});
