import React from 'react';
import moment from 'moment-timezone';

import UserActivityList from './UserActivityList';
import getMessage, { VarTypes } from './messageGenerator';
import { formatDate } from '../../../../utils/format';
import { cleanup } from '@testing-library/react';

import { usersActivityMock } from '../../../../mocks/settings';
import { shallow } from 'enzyme';
import { testid } from '../../../../utils/testUtilsEnzyme';
import { UserActivityType } from '../../../../graphql/types/globalTypes';

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

describe('messageGenerator', () => {
  let wrapper;
  const userActivity = {
    id: 'someId',
    user: {
      email: 'user@mail.com'
    },
    date: '2020-01-01',
    vars: []
  };
  const runtime = [
    {
      key: VarTypes.RUNTIME_ID,
      value: 'runtimeId'
    },
    {
      key: VarTypes.RUNTIME_NAME,
      value: 'runtimeName'
    }
  ];
  const version = [
    {
      key: VarTypes.VERSION_ID,
      value: 'versionId'
    },
    {
      key: VarTypes.VERSION_NAME,
      value: 'versionName'
    }
  ];
  const oldVersion = [
    {
      key: VarTypes.OLD_PUBLISHED_VERSION_ID,
      value: 'oldVersionId'
    },
    {
      key: VarTypes.OLD_PUBLISHED_VERSION_NAME,
      value: 'oldVersionName'
    }
  ];
  const setting = [
    {
      key: VarTypes.SETTING_NAME,
      value: 'setting'
    },
    {
      key: VarTypes.OLD_VALUE,
      value: 'oldValue'
    },
    {
      key: VarTypes.NEW_VALUE,
      value: 'newValue'
    }
  ];
  const config = [
    {
      key: VarTypes.CONFIG_KEYS,
      value: 'confA, confB, confC'
    }
  ];

  function setWrapper(props) {
    const [component, comment] = getMessage({ ...userActivity, ...props });
    wrapper = shallow(<div>{component}</div>);
  }

  afterEach(() => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right LOGIN message', () => {
    setWrapper({ type: UserActivityType.LOGIN });
  });

  it('show right LOGOUT message', () => {
    setWrapper({ type: UserActivityType.LOGOUT });
  });

  it('show right CREATE_RUNTIME message', () => {
    setWrapper({
      type: UserActivityType.CREATE_RUNTIME,
      vars: [...runtime]
    });
  });

  it('show right CREATE_VERSION message', () => {
    setWrapper({
      type: UserActivityType.CREATE_VERSION,
      vars: [...runtime, ...version]
    });
  });

  it('show right PUBLISH_VERSION message', () => {
    setWrapper({
      type: UserActivityType.PUBLISH_VERSION,
      vars: [...runtime, ...version, ...oldVersion]
    });
  });

  it('show right UNPUBLISH_VERSION message', () => {
    setWrapper({
      type: UserActivityType.UNPUBLISH_VERSION,
      vars: [...runtime, ...version]
    });
  });

  it('show right STOP_VERSION message', () => {
    setWrapper({
      type: UserActivityType.STOP_VERSION,
      vars: [...runtime, ...version]
    });
  });

  it('show right START_VERSION message', () => {
    setWrapper({
      type: UserActivityType.START_VERSION,
      vars: [...runtime, ...version]
    });
  });

  it('show right UPDATE_SETTING message', () => {
    setWrapper({
      type: UserActivityType.UPDATE_SETTING,
      vars: [...setting]
    });
  });

  it('show right UPDATE_VERSION_CONFIGURATION message', () => {
    setWrapper({
      type: UserActivityType.UPDATE_VERSION_CONFIGURATION,
      vars: [...runtime, ...version, ...config]
    });
  });
});
