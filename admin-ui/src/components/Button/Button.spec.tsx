import React from 'react';
import { renderWithRouter } from '../../utils/testUtils';
import { fireEvent, cleanup } from '@testing-library/react';
import { getByTestId } from '@testing-library/dom';
import Button from './Button';

afterEach(cleanup);

it('Renders Button without crashing', () => {
  const {
    element: { container }
  } = renderWithRouter(<Button />);
  expect(container).toMatchSnapshot();
});

it('Shows right texts', () => {
  const {
    element: { customRerender, container }
  } = renderWithRouter(<Button />);
  expect(container.textContent).toBe('Button');

  customRerender(<Button label="New Text" />);
  expect(container.textContent).toBe('New Text');

  customRerender(
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

  const {
    element: { getByText }
  } = renderWithRouter(<Button onClick={clickMock} />);

  fireEvent.click(getByText('Button'));
  expect(clickMock).toHaveBeenCalledTimes(1);
});

it('shows loader when loading', () => {
  const {
    element: { container }
  } = renderWithRouter(<Button loading />);

  expect(getByTestId(container, 'spinner')).toBeInTheDocument();
});

it('is a route button when a path is given', () => {
  const {
    element: { container }
  } = renderWithRouter(<Button to="/login/:someParam" />);

  expect(getByTestId(container, 'buttonLink')).toBeInTheDocument();
});
