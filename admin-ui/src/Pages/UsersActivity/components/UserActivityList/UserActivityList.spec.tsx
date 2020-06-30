import getMessage, { VarTypes } from './messageGenerator';

import React from 'react';
import { UserActivityType } from 'Graphql/types/globalTypes';
import { cleanup } from '@testing-library/react';
import moment from 'moment-timezone';
import { shallow } from 'enzyme';
import { usersActivityMock } from 'Mocks/settings';

moment.tz.setDefault('UTC');

const mockmockusersActivity = usersActivityMock.result.data.userActivityList;
jest.mock('@apollo/react-hooks', () => ({
  useQuery: jest.fn(() => ({
    data: { userActivityList: mockmockusersActivity }
  }))
}));

afterEach(cleanup);

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
