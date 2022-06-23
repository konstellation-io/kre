import FiltersBar from './FiltersBar';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { mountApolloComponent } from 'Utils/testUtilsEnzyme';
import { runtimeAndVersions } from 'Mocks/runtime';
import { usersMock } from 'Mocks/users';

const mocks = [usersMock];

function Wrapper({ mocks }: any) {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <FiltersBar
        setAndSubmit={jest.fn()}
        runtimesAndVersions={[runtimeAndVersions]}
        errors={{}}
        watch={jest.fn()}
        reset={jest.fn()}
      />
    </MockedProvider>
  );
}
const Component = <Wrapper mocks={mocks} />;

describe('FiltersBar', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = await mountApolloComponent(Component);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
