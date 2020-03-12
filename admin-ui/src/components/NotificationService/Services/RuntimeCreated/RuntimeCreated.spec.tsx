import React from 'react';
import RuntimeCreated from './RuntimeCreated';
import { runtimeCreatedMock } from '../../../../mocks/runtime';
import { MockedProvider } from '@apollo/react-testing';
import { mountApolloComponent } from '../../../../utils/testUtilsEnzyme';

const mocks = [runtimeCreatedMock];

jest.mock('react-router', () => ({
  useLocation: jest.fn(() => ({
    pathname: ''
  })),
  useHistory: jest.fn(() => ({
    pathname: ''
  }))
}));

function Wrapper() {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <RuntimeCreated />
    </MockedProvider>
  );
}

describe('RuntimeCreated', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountApolloComponent(<Wrapper />);

    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', async () => {
    const wrapper = await mountApolloComponent(<Wrapper />);

    expect(wrapper.exists('div')).toBeTruthy();
  });

  // TODO: check how to test onSubscriptionData
});
