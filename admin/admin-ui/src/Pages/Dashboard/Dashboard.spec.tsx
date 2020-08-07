import { dashboardErrorMock, dashboardMock } from 'Mocks/runtime';
import { mountWithRouter, prepareApolloComponent } from 'Utils/testUtilsEnzyme';

import { Button } from 'kwc';
import Dashboard from './Dashboard';
import Header from 'Components/Header/Header';
import Hexagon from 'Components/Shape/Hexagon/Hexagon';
import HexagonBorder from 'Components/Shape/Hexagon/HexagonBorder';
import { MockedProvider } from '@apollo/client/testing';
import NavigationBar from 'Components/NavigationBar/NavigationBar';
import React from 'react';
import { usernameMock } from 'Mocks/auth';

const mocks = [dashboardMock, usernameMock, dashboardMock];
const errorMocks = [dashboardErrorMock, usernameMock, dashboardMock];

function Wrapper({ mocks }: any) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Dashboard />
    </MockedProvider>
  );
}
const Component = <Wrapper mocks={mocks} />;
const ComponentError = <Wrapper mocks={errorMocks} />;

function getRuntimeField(position: number, field: string): string {
  // @ts-ignore
  return dashboardMock.result.data.runtimes[position][field];
}
const getRuntimeName = (pos: number) => getRuntimeField(pos, 'name');

describe('Dashboard', () => {
  it('shows splash screen', async () => {
    const { wrapper } = mountWithRouter({ component: Component });

    expect(wrapper.exists({ 'data-testid': 'splashscreen' })).toBeTruthy();
  });

  it('contains Header and Navigation bar', async () => {
    const { wrapper } = await prepareApolloComponent(Component);

    expect(wrapper.exists(NavigationBar)).toBeTruthy();
    expect(wrapper.exists(Header)).toBeTruthy();
  });

  it('shows error component', async () => {
    const { wrapper } = await prepareApolloComponent(ComponentError);

    expect(wrapper.exists(Hexagon)).toBeFalsy();
  });

  it('shows runtimes', async () => {
    const { wrapper } = await prepareApolloComponent(Component);

    expect(wrapper.exists(Hexagon)).toBeTruthy();
    expect(
      wrapper
        .find({ 'data-testid': 'hexTitle' })
        .first()
        .text()
    ).toBe(getRuntimeName(0));
    expect(wrapper.find(Hexagon).length).toEqual(3);
    expect(wrapper.exists(HexagonBorder)).toBeTruthy();
  });

  test('hexagons contains right hrefs', async () => {
    const { wrapper } = await prepareApolloComponent(Component);

    expect(
      wrapper
        .find(Hexagon)
        .at(0)
        .find('a')
        .props().href
    ).toEqual('/runtimes/00001');
  });

  test('Runtimes is disabled if it is on CREATING status', async () => {
    const { wrapper } = await prepareApolloComponent(Component);

    expect(
      wrapper
        .find(Hexagon)
        .at(2)
        .prop('disabled')
    ).toBeTruthy();
  });

  test('+ ADD RUNTIME hexagon redirect to add runtime page', async () => {
    const { wrapper } = await prepareApolloComponent(Component);

    expect(
      wrapper
        .find(HexagonBorder)
        .at(0)
        .find('a')
        .props().href
    ).toEqual('/new-runtime');
  });

  it('redirects to add runtime on ADD RUNTIME header button', async () => {
    const { wrapper } = await prepareApolloComponent(Component);

    expect(
      wrapper
        .find(Button)
        .find({ label: 'ADD RUNTIME' })
        .find('a')
        .props().href
    ).toEqual('/new-runtime');
  });
});
