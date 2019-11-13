import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getByTestId } from '@testing-library/dom';
import Button from './Button';

afterEach(cleanup);

it('Renders Button without crashing', () => {
  const { container } = render(<Button />);
  expect(container).toMatchSnapshot();
});

it('Shows right texts', () => {
  const { rerender, container } = render(<Button />);
  expect(container.textContent).toBe('Button');

  rerender(<Button label="New Text" />);
  expect(container.textContent).toBe('New Text');

  rerender(
    <Button
      label="Other Text"
      type="dark"
      onClick={function() {}}
      primary
      disabled
    />
  );
  expect(container.textContent).toBe('Other Text');
});

it('Handles click events', () => {
  const clickMock = jest.fn(() => true);

  const { getByText } = render(<Button onClick={clickMock} />);
  fireEvent.click(getByText('Button'));

  expect(clickMock).toHaveBeenCalledTimes(1);
});

it('shows loader when loading', () => {
  const { container } = render(<Button loading />);

  expect(getByTestId(container, 'spinner')).toBeInTheDocument();
});

it('is a route button when a path is given', () => {
  const history = createMemoryHistory();
  const { container } = render(
    <Router history={history}>
      <Button to="/login" />
    </Router>
  );

  expect(getByTestId(container, 'buttonLink')).toBeInTheDocument();
});
