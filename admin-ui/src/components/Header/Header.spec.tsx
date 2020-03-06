import React from 'react';
import {
  mountWithRouter,
  prepareApolloComponent,
  testid
} from '../../utils/testUtilsEnzyme';
import Header from './Header';

import { MockedProvider } from '@apollo/react-testing';
import { usernameMock, unauthorizedUsernameMock } from '../../mocks/auth';

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
const ComponentError = <Wrapper mocks={errorMocks} />;

it('Shows right structure', async () => {
  const { wrapper } = await prepareApolloComponent(Component);

  expect(wrapper.exists('header')).toBeTruthy();
  expect(wrapper.find(testid('settings-label')).text()).toBe(
    usernameMock.result.data.me.email
  );
});

it('handles loading status', async () => {
  const { wrapper } = mountWithRouter({ component: ComponentError });

  expect(wrapper.exists(testid('splashscreen'))).toBeTruthy();
  expect(wrapper.exists('header')).toBeFalsy();
});
