import React from 'react';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from '../store';
import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';
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

export function renderWithRouter(
  component: any,
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
  );

  // FIXME: typescript
  // @ts-ignore
  element.customRerender = function(newComponent: any) {
    element.rerender(<MemoryRouter>{newComponent}</MemoryRouter>);
  };

  return {
    element,
    history
  };
}

export function renderWithRedux(component: any, store = configureStore()) {
  return render(<Provider store={store}>{component}</Provider>);
}

export function renderWithReduxAndRouter(
  component: any,
  route = '/path/:someParam/index',
  store = configureStore()
) {
  const renderedElement = renderWithRouter(
    <Provider store={store}>{component}</Provider>,
    route
  );

  // FIXME: typescript definition
  // @ts-ignore
  renderedElement.element.customRerender = function(newComponent: any) {
    renderedElement.element.rerender(
      <Provider store={store}>
        <MemoryRouter>{newComponent}</MemoryRouter>
      </Provider>
    );
  };

  return renderedElement;
}
