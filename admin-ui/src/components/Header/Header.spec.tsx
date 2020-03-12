import React from 'react';
import { testid, mountApolloComponent } from '../../utils/testUtilsEnzyme';
import Header from './Header';

import { MockedProvider } from '@apollo/react-testing';
import { usernameMock, unauthorizedUsernameMock } from '../../mocks/auth';

jest.mock('react-router');
jest.mock('react-router-dom');

const mocks = [usernameMock];
const errorMocks = [unauthorizedUsernameMock];

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
