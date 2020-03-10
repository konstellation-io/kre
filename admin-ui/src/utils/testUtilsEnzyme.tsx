import React, { ReactElement } from 'react';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { MemoryRouter } from 'react-router';
import { act } from 'react-dom/test-utils';
import wait from 'waait';
import '@testing-library/jest-dom/extend-expect';
import { mount, ReactWrapper, shallow } from 'enzyme';

export async function getApolloResponses(
  wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>
) {
  await act(async () => {
    await wait(0);
    wrapper.update();
  });
}

type Params = {
  component: ReactElement;
  route?: string;
  params?: { [key: string]: string };
};
export function renderWithRouter(
  method: Function,
  {
    component,
    route = '/path/:someParam/index',
    params = { param: 'someValue' }
  }: Params
) {
  let urlRoute: string = route;
  const history = createMemoryHistory();

  Object.entries(params).forEach(([param, value]) => {
    urlRoute = urlRoute.replace(param, value);
  });

  history.push(urlRoute);

  const wrapper = method(
    <MemoryRouter>
      <Router history={history}>
        <Route path={route}>{component}</Route>
      </Router>
    </MemoryRouter>
  );

  return {
    wrapper,
    history
  };
}
export function shallowWithRouter(params: Params) {
  return renderWithRouter(shallow, params);
}
export function mountWithRouter(params: Params) {
  return renderWithRouter(mount, params);
}

export async function prepareApolloComponent(component: ReactElement) {
  const element = mountWithRouter({ component });

  await getApolloResponses(element.wrapper);

  return element;
}

export async function mountApolloComponent(
  component: ReactElement,
  wait = true
) {
  const wrapper = mount(component);

  if (wait) await getApolloResponses(wrapper);

  return wrapper;
}

export function testid(testId: string) {
  return { 'data-testid': testId };
}

export function label(label: string) {
  return { label: label };
}
