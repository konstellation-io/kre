import React from 'react';
import moment from 'moment-timezone';

import UserActivityList from './UserActivityList';
import { formatDate } from '../../../../utils/format';
import { cleanup } from '@testing-library/react';

import { usersActivityMock } from '../../../../mocks/settings';
import { shallow } from 'enzyme';
import { testid } from '../../../../utils/testUtilsEnzyme';

const mockData = usersActivityMock.result.data.userActivityList;

moment.tz.setDefault('UTC');

afterEach(cleanup);

describe('UserActivityList', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<UserActivityList data={mockData} />);
  });

  it('Shows right texts', async () => {
    const userActivityNode0 = wrapper.find(testid('userActivityListElement0'));
    const userActivityNode1 = wrapper.find(testid('userActivityListElement1'));

    const dateFormatted = formatDate(
      new Date('2019-11-27T15:28:01+00:00'),
      true
    );
    const user0 = userActivityNode0.find('.user');
    const message0 = userActivityNode0.find('.message');
    const date1 = userActivityNode1.find('.date p');

    expect(user0.text()).toBe('user1@domain.com');
    expect(message0.text()).toBe('Has logged in');
    expect(date1.text()).toBe(dateFormatted);
  });
});
