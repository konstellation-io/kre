import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Header from './Header';
import '@testing-library/jest-dom/extend-expect';

import wait from 'waait';
import { MockedProvider } from '@apollo/react-testing';
import { usernameMock } from '../../mocks/auth';

function renderComponent() {
  return render(
    <MockedProvider mocks={[usernameMock]} addTypename={false}>
      <Header />
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
