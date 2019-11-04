import React from 'react';
import { render, fireEvent, cleanup, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Router } from 'react-router-dom'
import * as ROUTE from '../../constants/routes';
import Sidebar, { Tab } from './Sidebar';
import { createMemoryHistory, History } from 'history';
import '@testing-library/jest-dom/extend-expect';

afterEach(cleanup);

const tabs:Tab[] = [
  {
    label: 'GENERAL',
    icon: undefined,
    route: ROUTE.SETTINGS_GENERAL
  },
  {
    label: 'SECURITY',
    icon: undefined,
    route: ROUTE.SETTINGS_SECURITY
  },
  {
    label: 'AUDIT',
    icon: undefined,
    route: ROUTE.SETTINGS_AUDIT
  },
];

function generateComponent() {
  const history = createMemoryHistory();
  history.push(ROUTE.HOME);
  history.push(ROUTE.SETTINGS);

  const wrapper = render(
    <MemoryRouter>
      <Router history={history}>
        <Sidebar
          title='SIDEBAR'
          history={history}
          location={history.location}
          tabs={tabs}
        />
      </Router>
    </MemoryRouter>
  );

  return [wrapper, history];
}

it('Renders Sidebar without crashing', () => {
  const {container} = generateComponent()[0] as RenderResult;
  expect(container).toMatchSnapshot();
});

it('Shows navigation buttons', () => {
  const {getByText} = generateComponent()[0] as RenderResult;

  expect(getByText('GENERAL')).toBeInTheDocument();
  expect(getByText('SECURITY')).toBeInTheDocument();
  expect(getByText('AUDIT')).toBeInTheDocument();
});

it('Changes route on button click', () => {
  const [{getByText}, history] = generateComponent() as [RenderResult, History];

  fireEvent.click(getByText('SIDEBAR'));
  expect(history.location.pathname).toBe(ROUTE.HOME);
});
