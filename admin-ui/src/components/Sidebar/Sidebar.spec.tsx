import React from 'react';
import {
  render,
  fireEvent,
  cleanup,
  RenderResult
} from '@testing-library/react';
import { renderWithReduxAndRouter } from '../../utils/testUtils';
import { MemoryRouter } from 'react-router';
import { Router } from 'react-router-dom';
import * as ROUTE from '../../constants/routes';
import Sidebar, { Tab } from './Sidebar';
import { createMemoryHistory, History } from 'history';

afterEach(cleanup);

const tabs: Tab[] = [
  {
    label: 'GENERAL',
    Icon: undefined,
    route: ROUTE.SETTINGS_GENERAL
  },
  {
    label: 'SECURITY',
    Icon: undefined,
    route: ROUTE.SETTINGS_SECURITY
  },
  {
    label: 'AUDIT',
    Icon: undefined,
    route: ROUTE.SETTINGS_AUDIT
  }
];

function generateComponent() {
  const history = createMemoryHistory();
  history.push(ROUTE.HOME);
  history.push(ROUTE.SETTINGS);

  const wrapper = renderWithReduxAndRouter(
    <Router history={history}>
      <Sidebar title="SIDEBAR" tabs={tabs} />
    </Router>
  );

  return [wrapper.element, history];
}
it('TODO: tests', () => {});
/*
it('Renders Sidebar without crashing', () => {
  const { container } = generateComponent()[0] as RenderResult;
  expect(container).toMatchSnapshot();
});

it('Shows navigation buttons', () => {
  const { getByText } = generateComponent()[0] as RenderResult;

  expect(getByText('GENERAL')).toBeInTheDocument();
  expect(getByText('SECURITY')).toBeInTheDocument();
  expect(getByText('AUDIT')).toBeInTheDocument();
});
*/
