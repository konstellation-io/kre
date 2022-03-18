import { ErrorMessage, SpinnerCircular } from 'kwc';
import { dashboardErrorMock, dashboardMock } from 'Mocks/runtime';
import { mountWithRouter, prepareApolloComponent } from 'Utils/testUtilsEnzyme';

import AddHexButton from './AddHexButton';
import HexButton from './HexButton';
import { MockedProvider } from '@apollo/client/testing';
import MultiHexButton from './MultiHexButton';
import { NavLink } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import React from 'react';

const mocks = [dashboardMock];
const errorMocks = [dashboardErrorMock];

function Wrapper({ mocks }: any) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <NavigationBar />
    </MockedProvider>
  );
}
const Component = <Wrapper mocks={mocks} />;
const ComponentError = <Wrapper mocks={errorMocks} />;

describe('NavigationBar', () => {
  it('handles loading status', () => {
    const { wrapper } = mountWithRouter({ component: Component });

    expect(wrapper.exists(SpinnerCircular)).toBeTruthy();
  });

  it('handles errors', async () => {
    const { wrapper } = await prepareApolloComponent(ComponentError);

    expect(wrapper.exists(ErrorMessage)).toBeTruthy();
  });

  it('show right components', async () => {
    const { wrapper } = await prepareApolloComponent(Component);

    expect(wrapper.find(NavLink).length).toBe(4);
    expect(wrapper.find(HexButton).length).toBe(3);
    expect(wrapper.exists(HexButton)).toBeTruthy();
    expect(wrapper.exists(MultiHexButton)).toBeTruthy();
    expect(wrapper.exists(AddHexButton)).toBeTruthy();
  });

  it('show right links', async () => {
    const { wrapper } = await prepareApolloComponent(Component);

    expect(wrapper.find(NavLink).exists({ to: '/new-runtime' })).toBeTruthy();
    expect(wrapper.find(NavLink).exists({ to: '/' })).toBeTruthy();
    expect(
      wrapper.find(NavLink).exists({ to: '/runtimes/00001' })
    ).toBeTruthy();
    expect(
      wrapper.find(NavLink).exists({ to: '/runtimes/00002' })
    ).toBeTruthy();
    expect(wrapper.find(NavLink).exists({ to: '/runtimes/00003' })).toBeFalsy();
  });
});
