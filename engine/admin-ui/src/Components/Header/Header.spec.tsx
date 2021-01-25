import { mountApolloComponent, testid } from 'Utils/testUtilsEnzyme';

import { BrowserRouter } from 'react-router-dom';
import Header from './Header';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { usernameMock } from 'Mocks/auth';

const mocks = [usernameMock];

function Wrapper({ mocks }: any) {
  return (
    <BrowserRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Header />
      </MockedProvider>
    </BrowserRouter>
  );
}
const Component = <Wrapper mocks={mocks} />;

describe('Header', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountApolloComponent(Component);

    expect(wrapper).toMatchSnapshot();
  });

  it('Shows right structure', async () => {
    const wrapper = await mountApolloComponent(Component);

    expect(wrapper.exists('header')).toBeTruthy();
    expect(wrapper.find(testid('settings-label')).text()).toBe(
      usernameMock.result.data.me.email
    );
  });

  it('handles loading status', async () => {
    const wrapper = await mountApolloComponent(Component, false);

    expect(wrapper.exists(testid('splashscreen'))).toBeTruthy();
    expect(wrapper.exists('header')).toBeFalsy();
  });
});
