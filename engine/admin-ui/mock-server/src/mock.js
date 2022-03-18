const { MockList } = require('apollo-server');
const casual = require('casual');
const moment = require('moment');
const { UserActivityOptions, metricsData } = require('./mockSamples');
const { PubSub } = require('apollo-server-express');
const { workflowNames, processNames, emails } = require('./data');

const pubsub = new PubSub();

const generateRuntime = () => ({
  id: parseInt(casual.array_of_digits(8).join('')),
  name: casual.name,
  description: casual.sentences(10),
  creationDate: casual.moment.toISOString(),
  versions: () => new MockList([1, 5]),
});

const generateVersion = (
  { id, name, status } = {
    id: casual.random_element(['v1', 'v2', 'v3', 'v4', 'v5', 'v6']),
    name: `v${casual.integer(1, 10)}.${casual.integer(1, 10)}.${casual.integer(1, 10)}`,
    status: 'PUBLISHED'
  }
) => ({
  id,
  name,
  description: casual.sentence,
  status,
  creationDate: casual.moment.toISOString(),
  publicationDate: casual.moment.toISOString(),
  workflows: () => new MockList(2)
});

let datetime = moment().subtract(24, 'hour');

function getProcessName() {
  return casual.random_element(processNames);
}
function getWorkflowName() {
  return casual.random_element(processNames);
}

function getLogLevel() {
  const rand = Math.random();
  switch (true) {
    case rand <= 0.02:
      return 'DEBUG';
    case rand <= 0.06:
      return 'ERROR';
    case rand <= 0.12:
      return 'WARN';
    default:
      return 'INFO';
  }
}

function getLogMessage() {
  return casual.sentences(casual.integer(1, 4));
}

let activeNodeLogsInterval = null;

const getPercStr = () => casual.integer(0, 100).toString();

const FREQUENCY_LOGS = 2000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  Subscription: () => ({
    watchNodeLogs: {
      subscribe: () => {
        activeNodeLogsInterval && clearInterval(activeNodeLogsInterval);
        activeNodeLogsInterval = setInterval(() => {
          pubsub.publish('watchNodeLogs', {
            watchNodeLogs: {
              id: casual.uuid,
              date: new Date().toUTCString(),
              nodeId: casual.uuid,
              nodeName: getProcessName(),
              workflowId: casual.uuid,
              workflowName: getWorkflowName(),
              message: getLogMessage,
              level: getLogLevel
            }
          });
        }, FREQUENCY_LOGS);
        setTimeout(() => {
          clearInterval(activeNodeLogsInterval);
        }, 5 * FREQUENCY_LOGS);
        return pubsub.asyncIterator('watchNodeLogs');
      }
    },
    watchVersion: {
      subscribe: () => pubsub.asyncIterator('watchVersion')
    },
    watchNodeStatus: {
      subscribe: () => {
        setTimeout(() => {
          pubsub.publish('watchNodeStatus', {
            watchNodeStatus: {
              id: 'entrypoint',
              status: 'STARTED'
            }
          });
        }, 5000);

        return pubsub.asyncIterator('watchNodeStatus');
      }
    },
  }),
  Query: () => ({
    me: () => ({
      id: 'loggedUserId',
      accessLevel: 'ADMIN',
      email: 'admin@intelygenz.com',
      apiTokens: () => new MockList([2, 5])
    }),
    users: () => new MockList([20, 30]),
    runtimes: () => new MockList([4, 8]),
    alerts: () => new MockList([1, 4]),
    versions: () => [
      generateVersion({ id: 'V1', name: 'Version-A', status: 'PUBLISHED' }),
      generateVersion({ id: 'V2', name: 'Version-B', status: 'STOPPED' }),
      generateVersion({ id: 'V3', name: 'Version-C', status: 'STARTED' }),
      generateVersion({ id: 'V4', name: 'Version-D', status: 'STARTED' }),
      generateVersion({ id: 'V5', name: 'Version-E', status: 'STARTED' }),
      generateVersion({ id: 'V6', name: 'Version-F', status: 'STOPPED' }),
      generateVersion({ id: 'V7', name: 'Version-G', status: 'STOPPED' }),
      generateVersion({ id: 'V8', name: 'Version-H', status: 'STOPPED' }),
      generateVersion({ id: 'V9', name: 'Version-I', status: 'STARTED' }),
    ],
    domains: () => new MockList([2, 6]),
    userActivityList: () => new MockList([30, 30]),
    logs: async () => {
      // await sleep(2000);
      return {
        cursor: casual.string,
        items: () => new MockList(40)
      };
    },
  }),
  Mutation: () => ({
    createVersion: () => generateVersion({ id: 'V3', name: 'Version-C' }),
    updateSettings: () => ({ errors: [], settings: this.Settings }),
    deleteApiToken: (_, b) => {
      return { id: b.input.id };
    },
    generateApiToken: () =>
      'JYHFGAKSYJFDH5786587656587FDSAKDHFGASJ5JYHFGAKSYJFDH5786587656587FDSAKDHFGASJ5JYHFGAKSYJFDH5786587656587FDSAKDHFGASJ5JYHFGAKSYJFDH5786587656587FDSAKDHFGASJ5JYHFGAKSYJFDH5786587656587FDSAKDHFGASJ5'
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
    accessLevel: casual.random_element(['ADMIN', 'VIEWER', 'MANAGER']),
    email: casual.random_element(emails),
    creationDate: new Date().toUTCString(),
    lastActivity: new Date().toUTCString(),
    activeSessions: casual.integer(0, 9)
  }),
  ApiToken: () => ({
    id: casual.uuid,
    name: casual.name,
    creationDate: new Date().toUTCString(),
    lastActivity: new Date().toUTCString()
  }),
  LogPane: () => ({
    cursor: casual.string,
    items: new MockList([6, 12])
  }),
  NodeLog: () => ({
    id: casual.uuid,
    date: new Date().toUTCString(),
    nodeId: casual.uuid,
    nodeName: getProcessName(),
    workflowId: casual.uuid,
    workflowName: getWorkflowName(),
    message: getLogMessage,
    level: getLogLevel
  }),
  Runtime: generateRuntime,
  Version: generateVersion,
  VersionConfig: () => ({
    completed: true,
    vars: () => new MockList([2, 20])
  }),
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
    sessionLifetimeInDays: () => casual.integer(1, 99)
  }),
  Workflow: () => ({
    name: casual.random_element(workflowNames),
    nodes: () => new MockList([1, 4]),
    edges: () => new MockList([1, 4])
  }),
  Edge: () => ({ id: casual.uuid, fromNode: casual.uuid, toNode: casual.uuid }),
  Node: () => {
    const _id = casual.uuid;
    setTimeout(() => {
      pubsub.publish('watchNodeStatus', {
        watchNodeStatus: {
          id: _id,
          status: casual.random_element(['STARTED', 'ERROR'])
        }
      });
    }, casual.integer(2000, 10000));
    return { id: _id, name: getProcessName(), status: 'STOPPED' };
  },
  MetricChartData: () => new MockList([5, 10])
};
