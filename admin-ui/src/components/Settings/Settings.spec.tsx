import React from 'react';
import { renderWithRouter } from '../../utils/testUtils';
import { fireEvent, cleanup } from '@testing-library/react';
import Settings from './Settings';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { getByTestId } from '@testing-library/dom';

afterEach(cleanup);

function renderComponent() {
  return renderWithRouter(
    <ApolloProvider
      client={
        new ApolloClient({
          cache: new InMemoryCache(),
          link: new ApolloLink()
        })
      }
    >
      <Settings />
    </ApolloProvider>
  ).element;
}

it('Renders Settings without crashing', () => {
  const { container } = renderComponent();
  expect(container).toMatchSnapshot();
});

it('Shows logout option', () => {
  const { getByText } = renderComponent();

  expect(getByText('LOGOUT')).toBeInTheDocument();
});

it('Shows options on mouse click', () => {
  const { container } = renderComponent();

  const settingsContent = getByTestId(container, 'settingsContent');
  // @ts-ignore
  expect(settingsContent.style['max-height']).toBe('0');

  fireEvent.click(getByTestId(container, 'settingsContainer'));
  // @ts-ignore
  expect(settingsContent.style['max-height']).not.toBe('0');

  fireEvent.click(getByTestId(container, 'settingsContainer'));
  // @ts-ignore
  expect(settingsContent.style['max-height']).toBe('0');
});

//TODO: make logout test
