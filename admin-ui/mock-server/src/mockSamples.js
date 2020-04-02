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
    { x: '30 Jan 2020 00:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 01:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 02:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 03:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 04:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 05:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 06:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 07:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 08:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 09:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 10:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 11:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 12:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 13:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 14:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 15:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 16:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 17:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 18:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 19:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 20:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 21:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 22:00 UTC', y: getPercStr() },
    { x: '30 Jan 2020 23:00 UTC', y: getPercStr() },
    { x: '31 Jan 2020 00:00 UTC', y: getPercStr() },
    { x: '31 Jan 2020 01:00 UTC', y: getPercStr() },
    { x: '31 Jan 2020 02:00 UTC', y: getPercStr() },
    { x: '31 Jan 2020 03:00 UTC', y: getPercStr() },
    { x: '31 Jan 2020 04:00 UTC', y: getPercStr() },
    { x: '31 Jan 2020 05:00 UTC', y: getPercStr() }
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
      type: 'CREATE_RUNTIME',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'CREATE_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'PUBLISH_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
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
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'STOP_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'START_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
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
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' },
        { key: 'CONFIG_KEYS', value: 'KEY_A, KEY_B' }
      ]
    }
  ];
}

module.exports = {
  UserActivityOptions: getOptions,
  metricsData
};
