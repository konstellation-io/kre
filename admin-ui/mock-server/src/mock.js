const { MockList } = require('apollo-server');
const casual = require('casual');
const { UserActivityOptions, metricsData } = require('./mockSamples');
const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();

const generateRuntime = () => ({
  id: parseInt(casual.array_of_digits(8).join('')),
  name: casual.name,
  status: casual.random_element(['CREATING', 'STARTED', 'ERROR']),
  creationDate: casual.moment.toISOString(),
  versions: () => new MockList([1, 5]),
  publishedVersion: () => {
    if (Math.random() > 0.5) {
      return {
        id: parseInt(casual.array_of_digits(8).join('')),
        name: `v${casual.integer((from = 1), (to = 10))}.${casual.integer(
          (from = 1),
          (to = 10)
        )}.${casual.integer((from = 1), (to = 10))}`,
        description: casual.sentence,
        status: 'STARTED',
        creationDate: casual.moment.toISOString(),
        activationDate: casual.moment.toISOString()
      };
    }
    return null;
  }
});

const generateVersion = () => ({
  id: casual.random_element(['v1', 'v2', 'v3', 'v4', 'v5', 'v6']),
  name: `v${casual.integer((from = 1), (to = 10))}.${casual.integer(
    (from = 1),
    (to = 10)
  )}.${casual.integer((from = 1), (to = 10))}`,
  description: casual.sentence,
  status: casual.random_element([
    'STARTING',
    'STARTED',
    'PUBLISHED',
    'STOPPED'
  ]),
  creationDate: casual.moment.toISOString(),
  publicationDate: casual.moment.toISOString(),
  configurationVariables: () => new MockList([2, 20]),
  configurationCompleted: true
});

let activeNodeLogsInterval = null;

const getPercStr = () => casual.integer((from = 0), (to = 100)).toString();

module.exports = {
  Subscription: () => ({
    nodeLogs: {
      subscribe: () => {
        activeNodeLogsInterval && clearInterval(activeNodeLogsInterval);
        activeNodeLogsInterval = setInterval(() => {
          pubsub.publish('nodeLogs', {
            nodeLogs: {
              date: new Date().toUTCString(),
              type: 'type',
              versionId: casual.uuid,
              nodeId: casual.uuid,
              podId: casual.uuid,
              message: casual.sentence,
              level: 'LEVEL'
            }
          });
        }, 3000);
        setTimeout(() => {
          clearInterval(activeNodeLogsInterval);
        }, 70000);
        return pubsub.asyncIterator('nodeLogs');
      }
    },
    runtimeCreated: {
      subscribe: () => pubsub.asyncIterator('runtimeCreated')
    },
    versionNodeStatus: {
      subscribe: () => pubsub.asyncIterator('versionNodeStatus')
    }
  }),
  Query: () => ({
    users: () => new MockList([4, 6]),
    runtimes: () => new MockList([4, 8]),
    alerts: () => new MockList([1, 4]),
    versions: () => new MockList([18, 28]),
    domains: () => new MockList([2, 6]),
    userActivityList: () => new MockList([30, 30])
  }),
  Mutation: () => ({
    createRuntime: () => {
      setTimeout(() => {
        const _runtime = generateRuntime();
        pubsub.publish('runtimeCreated', {
          runtimeCreated: { id: _runtime.id, name: _runtime.name }
        });
      }, 4000);
      return { errors: [], runtime: this.Runtime };
    },
    createVersion: () => ({ errors: [], version: version }),
    updateSettings: () => ({ errors: [], settings: this.Settings })
  }),
  MetricsValues: () => ({
    accuracy: this.MetricsAccuracy,
    missing: getPercStr(),
    newLabels: getPercStr()
  }),
  MetricsAccuracy: () => ({
    total: getPercStr(),
    micro: getPercStr(),
    macro: getPercStr(),
    weighted: getPercStr()
  }),
  MetricsCharts: () => ({
    confusionMatrix: metricsData.DataMatrix(),
    seriesAccuracy: metricsData.DataNumberStr(),
    seriesRecall: metricsData.DataNumberStr(),
    seriesSupport: metricsData.DataNumberStr(),
    successVsFails: metricsData.DataHourNumber()
  }),
  User: () => ({
    id: casual.uuid,
    email: casual.random_element([
      'user1@intelygenz.com',
      'user2@intelygenz.com',
      'user3@intelygenz.com',
      'user4@intelygenz.com',
      'user5@intelygenz.com',
      'user6@intelygenz.com'
    ])
  }),
  Runtime: generateRuntime,
  Version: generateVersion,
  ConfigurationVariable: () => ({
    key: casual.word.toUpperCase(),
    value: () => {
      if (Math.random() < 0.1) {
        return '';
      }
      return casual.sentence;
    },
    type: casual.random_element(['VARIABLE', 'FILE'])
  }),
  Alert: () => ({
    id: casual.uuid,
    type: 'ERROR',
    message: casual.sentence,
    runtime: this.Runtime
  }),
  UserActivity: () => casual.random_element(UserActivityOptions(this.User)),
  Settings: () => ({
    authAllowedDomains: () => new MockList([2, 6], () => casual.domain),
    sessionLifetimeInDays: () => casual.integer((from = 1), (to = 99))
  }),
  Workflow: () => ({
    name: casual.name,
    nodes: () => new MockList([1, 4]),
    edges: () => new MockList([1, 4])
  }),
  Edge: () => ({ id: casual.uuid, fromNode: casual.uuid, toNode: casual.uuid }),
  Node: () => {
    const _id = casual.uuid;
    setTimeout(() => {
      pubsub.publish('versionNodeStatus', {
        versionNodeStatus: {
          date: new Date().toUTCString(),
          nodeId: _id,
          status: casual.random_element(['STARTED', 'ERROR']),
          message: 'message'
        }
      });
    }, casual.integer(2000, 10000));
    return { id: _id, name: casual.name, status: 'STOPPED' };
  },
  MetricChartData: () => new MockList([5, 10])
};
