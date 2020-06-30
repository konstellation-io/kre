import { mountApolloComponent, testid } from 'Utils/testUtilsEnzyme';

import Header from './Header';
import { MockedProvider } from '@apollo/react-testing';
import React from 'react';
import { usernameMock } from 'Mocks/auth';

jest.mock('react-router');
jest.mock('react-router-dom');

const mocks = [usernameMock];

function Wrapper({ mocks }: any) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Header />
    </MockedProvider>
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
