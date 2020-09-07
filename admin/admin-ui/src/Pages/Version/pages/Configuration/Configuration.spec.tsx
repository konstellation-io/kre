import { BrowserRouter } from 'react-router-dom';
import Configuration from './Configuration';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { confVarsMock } from 'Mocks/version';
import { mountApolloComponent } from 'Utils/testUtilsEnzyme';

jest.mock('index', () => ({
  API_BASE_URL: 'url'
}));

const mocks = [confVarsMock];

const Component = () => (
  <BrowserRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <Configuration />
    </MockedProvider>
  </BrowserRouter>
);

describe('Configuration', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = await mountApolloComponent(<Component />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
