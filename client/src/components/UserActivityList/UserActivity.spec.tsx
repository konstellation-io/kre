import React from 'react';
import UserActivityList from './UserActivityList';
import { formatDate } from '../../utils/format';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MockedProvider } from '@apollo/react-testing';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

import { usersActivityMock } from '../../mocks/settings';


const mocks = [usersActivityMock];

const Component = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <UserActivityList />
  </MockedProvider>
);

afterEach(cleanup);

it('Render UserActivityList without crashing', () => {
  const { container } = render(Component );

  expect(container).toMatchSnapshot();
});

it('Shows right texts', async () => {
  const { queryByTestId } = render(Component);
  expect(queryByTestId('userActivityListElement0')).toBeNull();

  await act(async () => {
    await wait(0);
  });

  const userActivityNode0 = queryByTestId('userActivityListElement0');
  const userActivityNode1 = queryByTestId('userActivityListElement1');
  expect(userActivityNode0).not.toBeNull();

  const dateFormatted = formatDate(new Date('2019-01-02'), true);
  const user0 = userActivityNode0 && userActivityNode0.querySelector('.user');
  const message0 = userActivityNode0 && userActivityNode0.querySelector('.message');
  const date1 = userActivityNode1 && userActivityNode1.querySelector('.date p');
  expect(user0 && user0.textContent).toBe('user1@domain.com');
  expect(message0 && message0.textContent).toBe('some message 1');
  expect(date1 && date1.textContent).toBe(dateFormatted);
});

it('Shows filtered results', async () => {
  const { queryByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <UserActivityList filter={'user2'} />
    </MockedProvider>
  );
  
  await act(async () => {
    await wait(0);
  });

  const userActivityNode0 = queryByTestId('userActivityListElement0');
  const user0 = userActivityNode0 && userActivityNode0.querySelector('.user');
  expect(user0 && user0.textContent).toBe('user2@domain.com');
});

it('Handles errors', async () => {
  const errorMock = {
    ...mocks[0],
    error: new Error('cannot retrieve users activity')
  };
  const { getByText } = render((
    <MockedProvider mocks={[errorMock]} addTypename={false}>
      <UserActivityList/>
    </MockedProvider>
  ));

  await act(async () => {
    await wait(0);
  });

  expect(getByText('ERROR')).toBeInTheDocument();
});
