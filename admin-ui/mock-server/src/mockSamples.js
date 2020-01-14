const casual = require('casual');


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
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
      ]
    },
    {
      ...UserActivityBase,
      type: 'CREATE_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' },
      ]
    },
    {
      ...UserActivityBase,
      type: 'ACTIVATE_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' },
        { key: 'OLD_ACTIVE_VERSION_NAME', value: 'VERSION 1' },
        { key: 'OLD_ACTIVE_VERSION_ID', value: 'ID_003' },
        { key: 'COMMENT', value: 'This version includes the bug fixing regarding the security vulnerability #12345' }
      ]
    },
    {
      ...UserActivityBase,
      type: 'DEACTIVATE_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' },
      ]
    },
    {
      ...UserActivityBase,
      type: 'STOP_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' },
      ]
    },
    {
      ...UserActivityBase,
      type: 'DEPLOY_VERSION',
      vars: [
        { key: 'RUNTIME_ID', value: 'ID_001' },
        { key: 'RUNTIME_NAME', value: 'Runtime X' },
        { key: 'VERSION_ID', value: 'ID_002' },
        { key: 'VERSION_NAME', value: 'Version Y' },
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
        { key: 'CONFIG_KEYS', value: 'KEY_A, KEY_B' },
      ]
    }
  ];
}

module.exports = {
  UserActivityOptions: getOptions
};
