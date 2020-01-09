const { MockList } = require('graphql-tools');
const casual = require('casual');

module.exports = {
  Query: () =>({
    users: () => new MockList([4, 6]),
    runtimes: () => new MockList([4, 8]),
    alerts: () => new MockList([1, 4]),
    versions: () => new MockList([8, 12]),
    domains: () => new MockList([2, 6]),
    userActivityList: () => new MockList([30, 30]),
  }),
  Mutation: () => ({
    createRuntime: () => ({
      errors: [],
      runtime: this.Runtime
    }),
    createVersion: () => ({
      errors: [],
      version: this.Version
    }),
    updateSettings: () => ({
      errors: [],
      settings: this.Settings
    }),
  }),
  User: () => ({
    id: casual.id,
    email: casual.random_element([
      'user1@intelygenz.com',
      'user2@intelygenz.com',
      'user3@intelygenz.com',
      'user4@intelygenz.com',
      'user5@intelygenz.com',
      'user6@intelygenz.com',
    ])
  }),
  Runtime: () => ({
    id: parseInt(casual.array_of_digits(8).join('')),
    name: casual.name,
    status: casual.random_element(['CREATING', 'RUNNING', 'ERROR']),
    creationDate: casual.moment.toISOString(),
    versions: () => new MockList([1, 5]),
    activeVersion: () => {
      if (Math.random() > 0.5) {
        return {
          id: parseInt(casual.array_of_digits(8).join('')),
          name: `v${casual.integer(from = 1, to = 10)}.${casual.integer(from = 1, to = 10)}.${casual.integer(from = 1, to = 10)}`,
          description: casual.sentence,
          status: 'ACTIVE',
          creationDate: casual.moment.toISOString(),
          activationDate: casual.moment.toISOString(),
        }
      }
      return null;
    },
  }),
  Version: () => ({
    id: parseInt(casual.array_of_digits(8).join('')),
    name: `v${casual.integer(from = 1, to = 10)}.${casual.integer(from = 1, to = 10)}.${casual.integer(from = 1, to = 10)}`,
    description: casual.sentence,
    status: casual.random_element(['CREATED', 'ACTIVE', 'RUNNING', 'STOPPED']),
    creationDate: casual.moment.toISOString(),
    activationDate: casual.moment.toISOString(),
    configurationVariables: () => new MockList([20, 25]),
    configurationCompleted: true
  }),
  ConfigurationVariable: () => ({
    id: casual.id,
    variable: casual.word.toUpperCase(),
    value: () => {
      if (Math.random() < 0.1) {
        return '';
      }
      return casual.sentence;
    },
    type: casual.random_element(['VARIABLE', 'FILE']),
    protected: false
  }),
  Alert: () => ({
    id: casual.id,
    type: 'ERROR',
    message: casual.sentence,
    runtime: this.Runtime
  }),
  UserActivity: () => ({
    id: casual.id,
    user: this.User,
    message: casual.sentence,
    date: casual.moment.toISOString(),
    type: casual.random_element(['LOGIN', 'LOGOUT', 'CREATE_RUNTIME']),
  }),
  Settings: () => ({
    authAllowedDomains: () => new MockList([2, 6], () => casual.domain),
    sessionLifetimeInDays: () => casual.integer(from = 1, to = 99)
  }),
  Workflow: () => ({
    name: casual.name,
    nodes: () => new MockList([1, 4]),
    edges: () => new MockList([1, 4]),
  }),
  Edge: () => ({
    id: casual.ID,
    fromNode: casual.ID,
    toNode: casual.ID,
  }),
  Node: () => ({
    id: casual.ID,
    name: casual.name,
    status: 'ACTIVE'
  })
}
