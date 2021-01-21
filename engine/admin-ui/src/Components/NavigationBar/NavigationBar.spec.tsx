import { MockedProvider } from '@apollo/client/testing';
import NavigationBar from './NavigationBar';
import React from 'react';

const Component = (
  <MockedProvider addTypename={false}>
    <NavigationBar />
  </MockedProvider>
);

describe('NavigationBar', () => {
  it('matches snapshot', () => {
    expect(Component).toMatchSnapshot();
  });
});
