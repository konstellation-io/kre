import React from 'react';
import DomainList, {GET_DOMAINS} from './DomainList';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import { act } from 'react-dom/test-utils';


const mocks = [
  {
    request: {
      query: GET_DOMAINS,
    },
    result: {
      data: {
        settings: {
          authAllowedDomains: [
            'domain.1',
            'domain.2',
            'domain.3.sample',
          ],
        }
      },
    },
  },
];

const Component = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <DomainList />
  </MockedProvider>
);

afterEach(cleanup);

it('Render DomainList without crashing', () => {
  const { container } = render(Component );

  expect(container).toMatchSnapshot();
});

it('Shows right texts', async () => {
  const { queryByTestId } = render(Component);
  expect(queryByTestId('domainListElement0')).toBeNull();

  await act(async () => {
    await wait(0);
  });

  const domainNode0 = queryByTestId('domainListName0');
  const domainNode1 = queryByTestId('domainListName1');
  expect(domainNode0).not.toBeNull();

  expect(domainNode0 && domainNode0.textContent).toBe('domain.1');
  expect(domainNode1 && domainNode1.textContent).toBe('domain.2');
});

it('Handles events', async () => {
  const clickMock = jest.fn(() => true);

  const { queryByTestId } = render((
    <MockedProvider mocks={mocks} addTypename={false}>
      <DomainList onRemoveDomain={clickMock}/>
    </MockedProvider>
  ));

  await act(async () => {
    await wait(0);
  });

  const removeNode0 = queryByTestId('domainListRemove0') as HTMLElement;
  fireEvent.click(removeNode0);

  expect(clickMock).toHaveBeenCalledTimes(1);
});

it('Handles errors', async () => {
  const errorMock = {
    ...mocks[0],
    error: new Error('cannot retrieve domains')
  };
  const { getByText } = render((
    <MockedProvider mocks={[errorMock]} addTypename={false}>
      <DomainList/>
    </MockedProvider>
  ));

  await act(async () => {
    await wait(0);
  });

  expect(getByText('ERROR')).toBeInTheDocument();
});
