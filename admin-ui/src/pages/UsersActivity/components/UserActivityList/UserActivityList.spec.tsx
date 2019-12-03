import React from 'react';
import moment from 'moment-timezone'

import UserActivityList from './UserActivityList';
import { formatDate } from '../../../../utils/format';
import { render, cleanup } from '@testing-library/react';

import { usersActivityMock } from '../../../../mocks/settings';
import '@testing-library/jest-dom/extend-expect';

const mockData = usersActivityMock.result.data.userActivityList;

const Component = <UserActivityList data={mockData} />;

moment.tz.setDefault('UTC');

afterEach(cleanup);

it('Render UserActivityList without crashing', () => {
  const { container } = render(Component);

  expect(container).toMatchSnapshot();
});

it('Shows right texts', async () => {
  const { queryByTestId } = render(Component);

  const userActivityNode0 = queryByTestId('userActivityListElement0');
  const userActivityNode1 = queryByTestId('userActivityListElement1');
  expect(userActivityNode0).not.toBeNull();

  const dateFormatted = formatDate(new Date('2019-11-27T15:28:01+00:00'), true);
  const user0 = userActivityNode0 && userActivityNode0.querySelector('.user');
  const message0 =
    userActivityNode0 && userActivityNode0.querySelector('.message');
  const date1 = userActivityNode1 && userActivityNode1.querySelector('.date p');
  expect(user0 && user0.textContent).toBe('user1@domain.com');
  expect(message0 && message0.textContent).toBe('Has logged in');
  expect(date1 && date1.textContent).toBe(dateFormatted);
});
