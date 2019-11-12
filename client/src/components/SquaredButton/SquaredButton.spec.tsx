import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SquaredButton from './SquaredButton';

afterEach(cleanup);

it('Renders SquaredButton without crashing', () => {
  const { container } = render(<SquaredButton />);
  expect(container).toMatchSnapshot();
});

it('Shows right texts', () => {
  const { rerender, container } = render(<SquaredButton />);
  expect(container.textContent).toBe('DF');

  rerender(<SquaredButton label="New Text" />);
  expect(container.textContent).toBe('New Text');
});

it('Handles click events', () => {
  const clickMock = jest.fn(() => true);

  const { getByText } = render(<SquaredButton onButtonClick={clickMock} />);
  fireEvent.click(getByText('DF'));

  expect(clickMock).toHaveBeenCalledTimes(1);
});
