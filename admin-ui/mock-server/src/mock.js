const { MockList } = require('graphql-tools');
const casual = require('casual');

module.exports = {
  Query: () =>({
    runtimes: () => new MockList([4, 8]),
    domains: () => new MockList([2, 6]),
    usersActivity: () => new MockList([20, 40]),
  }),
  User: () => ({
    id: casual.id,
    email: casual.email
  }),
  Dashboard: () => ({
    runtimes: () => new MockList([4, 8]),
    alerts: () => new MockList([1, 5])
  }),
  Runtime: () => ({
    id: parseInt(casual.array_of_digits(8).join('')),
    name: casual.name,
    status: casual.random_element(['active', 'warning', 'error', 'created']),
    creationDate: casual.date('YYYY-MM-DD'),
    versions: () => new MockList([1, 5])
  }),
  Version: () => ({
    id: parseInt(casual.array_of_digits(8).join('')),
    versionNumber: `v${casual.integer(from = 1, to = 10)}.${casual.integer(from = 1, to = 10)}.${casual.integer(from = 1, to = 10)}`,
    description: casual.sentence,
    status: 'active',//casual.random_element(['active', 'created', 'running', 'stopped']),
    creationDate: casual.date('YYYY-MM-DD'),
    creatorName: casual.email,
    activationDate: casual.date('YYYY-MM-DD'),
    activatorName: casual.email,
  }),
  Alert: () => ({
    id: casual.id,
    type: 'error',
    message: casual.sentence,
    runtime: this.Runtime
  }),
  Domain: () => ({
    id: casual.id,
    name: casual.domain
  }),
  UserActivity: () => ({
    id: casual.id,
    user: casual.email,
    message: casual.sentence,
    date: casual.date('YYYY-MM-DD')
  }),
  Settings: () => ({
    authAllowedDomains: () => new MockList([2, 6], () => casual.domain),
    cookieExpirationTime: () => casual.integer(from = 1, to = 99)
  }),
  RuntimeUpdateResponse: () => ({
    success: () => casual.boolean,
    message: () => casual.sentence,
    runtime: () => this.Runtime
  })
}
