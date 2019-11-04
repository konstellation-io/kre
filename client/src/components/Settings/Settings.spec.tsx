import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import Settings from './Settings';
import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';

afterEach(cleanup);

it('Renders Settings without crashing', () => {
  const { container } = render(<Settings />);
  expect(container).toMatchSnapshot();
});

it('Shows logout option', () => {
  const { getByText } = render(<Settings />);

  expect(getByText('LOGOUT')).toBeInTheDocument();
});

it('Shows options on mouse enter', () => {
  const { container } = render(<Settings />);

  const settingsContent = getByTestId(container, 'settingsContent');
  // @ts-ignore
  expect(settingsContent.style['max-height']).toBe('0');

  fireEvent.mouseEnter(getByTestId(container, 'settingsContainer'));
  // @ts-ignore
  expect(settingsContent.style['max-height']).not.toBe('0');
  
  fireEvent.mouseLeave(getByTestId(container, 'settingsContainer'));
  // @ts-ignore
  expect(settingsContent.style['max-height']).toBe('0');
});

//TODO: make logout test
