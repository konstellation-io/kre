import { addRuntimeMock, dashboardMock } from 'Mocks/runtime';
import { label, mountApolloComponent } from 'Utils/testUtilsEnzyme';

import AddRuntime from './AddRuntime';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { usernameMock } from 'Mocks/auth';

const mocks = [addRuntimeMock, dashboardMock, usernameMock];

function Wrapper() {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <AddRuntime />
    </MockedProvider>
  );
}

describe('AddRuntime', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountApolloComponent(<Wrapper />);

    expect(wrapper).toMatchSnapshot();
  });

  test('show right texts', async () => {
    const wrapper = await mountApolloComponent(<Wrapper />);

    expect(wrapper.exists('.container h1')).toBeTruthy();
    expect(wrapper.exists(label('SAVE'))).toBeTruthy();
  });
});
