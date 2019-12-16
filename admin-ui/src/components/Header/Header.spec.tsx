import React from 'react';
import { MemoryRouter } from 'react-router';
import { renderWithRedux } from '../../utils/testUtils';
import { act } from 'react-dom/test-utils';
import Header from './Header';

import wait from 'waait';
import { MockedProvider } from '@apollo/react-testing';
import { usernameMock } from '../../mocks/auth';
import '@testing-library/jest-dom/extend-expect';

function renderComponent() {
  return renderWithRedux(
    <MockedProvider mocks={[usernameMock]} addTypename={false}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </MockedProvider>
  );
}
it('Render Header without crashing', () => {
  const { container } = renderComponent();
  expect(container).toMatchSnapshot();
});

it('Shows right texts', async () => {
  const { getByText } = renderComponent();

  await act(async () => {
    await wait(0);
  });

  expect(getByText('user@konstellation.com')).toBeInTheDocument();
});
