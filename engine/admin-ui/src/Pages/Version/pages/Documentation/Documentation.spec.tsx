import { BrowserRouter } from 'react-router-dom';
import Documentation from './Documentation';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { mountApolloComponent } from 'Utils/testUtilsEnzyme';
import { usersMock } from 'Mocks/users';

jest.mock('index', () => ({
  API_BASE_URL: 'url'
}));

const mocks = [usersMock];

function Wrapper({ mocks }: any) {
  return (
    <BrowserRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Documentation />
      </MockedProvider>
    </BrowserRouter>
  );
}
const Component = <Wrapper mocks={mocks} />;

describe('Documentation', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = await mountApolloComponent(Component);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
