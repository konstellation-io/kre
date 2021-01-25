const casual = require('casual');

const labels = ['labelA', 'labelB', 'labelC', 'labelD'];
const getPercStr = () => casual.integer((from = 0), (to = 100)).toString();

const metricsData = {
  DataStrNumber: () => [
    { x: labels[0], y: getPercStr() },
    { x: labels[1], y: getPercStr() },
    { x: labels[2], y: getPercStr() },
    { x: labels[3], y: getPercStr() }
  ],
  DataHourNumber: () => [
    { x: '01 Jan 2020', y: getPercStr() },
    { x: '02 Jan 2020', y: getPercStr() },
    { x: '03 Jan 2020', y: getPercStr() },
    { x: '04 Jan 2020', y: getPercStr() },
    { x: '05 Jan 2020', y: getPercStr() },
    { x: '06 Jan 2020', y: getPercStr() },
    { x: '07 Jan 2020', y: '' },
    { x: '08 Jan 2020', y: '' },
    { x: '09 Jan 2020', y: '' },
    { x: '10 Jan 2020', y: getPercStr() },
    { x: '11 Jan 2020', y: getPercStr() },
    { x: '12 Jan 2020', y: getPercStr() },
    { x: '13 Jan 2020', y: '' },
    { x: '14 Jan 2020', y: getPercStr() },
    { x: '15 Jan 2020', y: getPercStr() },
    { x: '16 Jan 2020', y: getPercStr() },
    { x: '17 Jan 2020', y: getPercStr() },
    { x: '18 Jan 2020', y: getPercStr() },
    { x: '19 Jan 2020', y: getPercStr() },
    { x: '20 Jan 2020', y: getPercStr() },
    { x: '21 Jan 2020', y: getPercStr() },
    { x: '22 Jan 2020', y: getPercStr() },
    { x: '23 Jan 2020', y: getPercStr() },
    { x: '24 Jan 2020', y: getPercStr() },
    { x: '25 Jan 2020', y: getPercStr() },
    { x: '26 Jan 2020', y: getPercStr() },
    { x: '27 Jan 2020', y: getPercStr() },
    { x: '28 Jan 2020', y: getPercStr() },
    { x: '29 Jan 2020', y: getPercStr() },
    { x: '30 Jan 2020', y: getPercStr() }
  ],
  DataNumberStr: () => [
    { x: getPercStr(), y: labels[0] },
    { x: getPercStr(), y: labels[1] },
    { x: getPercStr(), y: labels[2] },
    { x: getPercStr(), y: labels[3] }
  ],
  DataMatrix: () => [
    {
      x: labels[0],
      y: labels[0],
      z: getPercStr()
    },
    {
      x: labels[0],
      y: labels[1],
      z: getPercStr()
    },
    {
      x: labels[0],
      y: labels[2],
      z: getPercStr()
    },
    {
      x: labels[1],
      y: labels[0],
      z: getPercStr()
    },
    {
      x: labels[1],
      y: labels[1],
      z: getPercStr()
    },
    {
      x: labels[1],
      y: labels[2],
      z: getPercStr()
    },
    {
      x: labels[2],
      y: labels[0],
      z: getPercStr()
    },
    {
      x: labels[2],
      y: labels[1],
      z: getPercStr()
    },
    {
      x: labels[2],
      y: labels[2],
      z: getPercStr()
    }
  ]
};

function getOptions(User) {
  const UserActivityBase = {
    id: casual.id,
    user: User,
    date: casual.moment.toISOString()
  };

  return [
    {
      ...UserActivityBase,
      type: 'LOGIN',
      vars: []
    },
    {
      ...UserActivityBase,
      type: 'LOGOUT',
      vars: []
    },
    {
      ...UserActivityBase,
      type: 'CREATE_VERSION',
      vars: [
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'PUBLISH_VERSION',
      vars: [
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' },
        { key: 'OLD_PUBLISHED_VERSION_NAME', value: 'VERSION 1' },
        { key: 'OLD_PUBLISHED_VERSION_ID', value: 'ID_003' },
        {
          key: 'COMMENT',
          value:
            'This version includes the bug fixing regarding the security vulnerability #12345'
        }
      ]
    },
    {
      ...UserActivityBase,
      type: 'UNPUBLISH_VERSION',
      vars: [
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'STOP_VERSION',
      vars: [
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'START_VERSION',
      vars: [
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'UPDATE_SETTING',
      vars: [
        { key: 'SETTING_NAME', value: 'EXPIRATION_TIME' },
        { key: 'OLD_VALUE', value: '10' },
        { key: 'NEW_VALUE', value: '55' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'UPDATE_VERSION_CONFIGURATION',
      vars: [
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' },
        { key: 'CONFIG_KEYS', value: 'KEY_A, KEY_B' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'CREATE_USER',
      vars: [
        { key: 'CREATED_USER_EMAIL', value: 'admin@konstellation.io' },
        { key: 'CREATED_USER_ACCESS_LEVEL', value: 'ADMIN' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'REMOVE_USERS',
      vars: [
        {
          key: 'USER_EMAILS',
          value: 'user1@kre.com, user2@kre.com, user3@kre.com'
        }
      ]
    },
    {
      ...UserActivityBase,
      type: 'UPDATE_ACCESS_LEVELS',
      vars: [
        {
          key: 'USER_EMAILS',
          value: 'user1@kre.com, user2@kre.com, user3@kre.com'
        },
        { key: 'ACCESS_LEVEL', value: 'MANAGER' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'REVOKE_SESSIONS',
      vars: [
        {
          key: 'USER_EMAILS',
          value: 'user1@kre.com, user2@kre.com, user3@kre.com'
        }
      ]
    },
    {
      ...UserActivityBase,
      type: 'GENERATE_API_TOKEN',
      vars: [
        {
          key: 'API_TOKEN_NAME',
          value: 'New API Token'
        }
      ]
    },
    {
      ...UserActivityBase,
      type: 'DELETE_API_TOKEN',
      vars: [
        {
          key: 'API_TOKEN_NAME',
          value: 'Old API Token'
        }
      ]
    }
  ];
}

module.exports = {
  UserActivityOptions: getOptions,
  metricsData
};
