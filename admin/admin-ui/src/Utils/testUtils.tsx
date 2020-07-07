import React, { ReactElement } from 'react';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { MemoryRouter } from 'react-router';
import { render, RenderResult } from '@testing-library/react';
import { mount } from 'enzyme';
import '@testing-library/jest-dom/extend-expect';

type TestHookprops = {
  callback: Function;
};
const TestHook = ({ callback }: TestHookprops) => {
  callback();
  return null;
};

export const testHook = (callback: Function) => {
  mount(<TestHook callback={callback} />);
};

interface RenderWithRouterEl extends RenderResult {
  customRerender: Function;
}

export function renderWithRouter(
  component: ReactElement,
  route: string = '/path/:someParam/index',
  param = { param: 'someParam', value: 'someValue' }
) {
  const history = createMemoryHistory();
  history.push(route.replace(param.param, param.value));

  const element = render(
    <MemoryRouter>
      <Router history={history}>
        <Route path={route}>{component}</Route>
      </Router>
    </MemoryRouter>
  ) as RenderWithRouterEl;

  element.customRerender = function(newComponent: ReactElement) {
    element.rerender(<MemoryRouter>{newComponent}</MemoryRouter>);
  };

  return {
    element,
    history
  };
}
