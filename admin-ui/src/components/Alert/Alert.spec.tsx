// FIXME: reformat this to new test format

import React from 'react';
import { renderWithRouter } from '../../utils/testUtils';
import { fireEvent, cleanup } from '@testing-library/react';
import Alert, { Props } from './Alert';
import ROUTE from '../../constants/routes';
import '@testing-library/jest-dom/extend-expect';

afterEach(cleanup);

const defaultProps: Props = {
  type: 'error',
  message: 'Sample message',
  runtimeId: 'someId'
};

function renderComponent(props: Props = defaultProps) {
  return renderWithRouter(<Alert {...props} />);
}

it('Renders Alert without crashing', () => {
  const {
    element: { container }
  } = renderComponent();

  expect(container).toMatchSnapshot();
});

it('shows right texts', () => {
  const {
    element: { getByText }
  } = renderComponent();

  expect(getByText('error')).toBeInTheDocument();
  expect(getByText('GO TO RUNTIME')).toBeInTheDocument();
  expect(getByText('Sample message')).toBeInTheDocument();
});

it('handle click events', () => {
  const {
    element: { getByText },
    history
  } = renderComponent();

  fireEvent.click(getByText('GO TO RUNTIME'));
  expect(history.location.pathname).toBe(
    ROUTE.RUNTIME.replace(':runtimeId', defaultProps.runtimeId)
  );
});
