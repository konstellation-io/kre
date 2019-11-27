import React from 'react';
import { fireEvent, cleanup, RenderResult } from '@testing-library/react';
import { renderWithReduxAndRouter } from '../../utils/testUtils';
import { Router } from 'react-router-dom';
import * as ROUTE from '../../constants/routes';
import NavigationBar, { navigationButtons } from './NavigationBar';
import { createMemoryHistory, History } from 'history';

afterEach(cleanup);

function generateComponent() {
  const history = createMemoryHistory();
  history.push(ROUTE.HOME);

  const wrapper = renderWithReduxAndRouter(
    <Router history={history}>
      <NavigationBar />
    </Router>
  );

  return [wrapper.element, history];
}

it('Renders NavigationBar without crashing', () => {
  const { container } = generateComponent()[0] as RenderResult;
  expect(container).toMatchSnapshot();
});

it('Shows navigation buttons', () => {
  const { container } = generateComponent()[0] as RenderResult;

  expect(container.querySelectorAll('.button').length).toBe(
    navigationButtons.length
  );
});

it('Changes route on button click', () => {
  const [{ container }, history] = generateComponent() as [
    RenderResult,
    History
  ];

  const settingsButton = container.querySelectorAll('.button')[1];
  fireEvent.click(settingsButton);

  expect(history.location.pathname).toBe(ROUTE.SETTINGS);
});
