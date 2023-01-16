import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';

import GetConfigurationVariablesQuery from '../Graphql/queries/getConfigurationVariables';
import GetVersionWorkflowsQuery from '../Graphql/queries/getVersionWorkflows';
import NodeStatusSubscription from '../Graphql/subscriptions/watchVersionNodeStatus';
import PublishVersionMutation from '../Graphql/mutations/publishVersion';
import StartVersionMutation from '../Graphql/mutations/startVersion';
import StopVersionMutation from '../Graphql/mutations/stopVersion';
import UnpublishVersionMutation from '../Graphql/mutations/unpublishVersion';
import {GetVersionWorkflows_version_workflows} from "../Graphql/queries/types/GetVersionWorkflows";
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from "../Graphql/queries/types/GetVersionConfStatus";

export const runtime: GetVersionConfStatus_runtime = {
  id: 'runtimeId',
  name: 'runtimeName',
  creationDate: 'creationDate',
  databaseUrl: 'databaseUrl',
  description: 'Some Description',
  measurementsUrl: 'measurementsUrl',
  entrypointAddress: 'entrypointAddress',
  __typename: 'Runtime'
};

export const workflow: GetVersionWorkflows_version_workflows = {
  __typename: 'Workflow',
  id: 'workflowId',
  name: 'Workflow Nane',
  exitpoint: 'exitpoint',
  nodes: [
    {
      __typename: 'Node',
      id: 'nodeId',
      name: 'Node Name',
      status: NodeStatus.STARTED,
      subscriptions: [],
      replicas: 1,
    }
  ],
  edges: [
    {
      __typename: 'Edge',
      id: 'edgeId',
      fromNode: 'node1',
      toNode: 'node2'
    }
  ]
};


export const version: GetVersionConfStatus_versions = {
  __typename: 'Version',
  id: 'versionId',
  name: 'versionName',
  description: 'versionDescription',
  status: VersionStatus.STARTED,
  creationDate: '2020/01/01',
  creationAuthor: {
    __typename: 'User',
    id: 'userId',
    email: 'user@domain.com'
  },
  publicationDate: '2020/01/01',
  publicationAuthor: {
    __typename: 'User',
    id: 'userId',
    email: 'user@domain.com'
  },
  config: {
    __typename: 'VersionConfig',
    completed: false
  },
  hasDoc: false,
  errors: [],
};

export const confVarsMock = {
  request: {
    query: GetConfigurationVariablesQuery,
    variables: {
      versionId: 'id'
    }
  },
  result: {
    data: {
      version: {
        status: 'STARTED',
        config: {
          completed: true,
          vars: [
            {
              key: 'var2',
              value: 'value1',
              type: 'VARIABLE'
            },
            {
              key: 'var1',
              value: 'value2',
              type: 'VARIABLE'
            },
            {
              key: 'var3',
              value: 'value3',
              type: 'FILE'
            }
          ]
        }
      }
    }
  }
};

export const workflowsMock = {
  request: {
    query: GetVersionWorkflowsQuery
  },
  result: {
    data: {
      version: {
        name: 'version01',
        krtVersion: 'v1',
        status: 'STARTED',
        configurationCompleted: true,
        workflows: [
          {
            name: 'workflow01',
            nodes: [
              {
                id: 'node01',
                name: 'one node',
                status: 'STARTED',
                replicas: 1
              },
              {
                id: 'node02',
                name: 'another node',
                status: 'STARTED',
                replicas: 1
              }
            ],
            edges: [
              {
                id: 'edge01',
                fromNode: 'node01',
                toNode: 'node02'
              }
            ]
          }
        ]
      }
    }
  }
};

export const errorMorkflowsMock = {
  request: {
    query: GetVersionWorkflowsQuery
  },
  error: 'Some error',
  result: {
    data: null
  }
};

export const nodeStatus = {
  request: {
    query: NodeStatusSubscription
  },
  result: {
    data: {
      versionNodeStatus: [
        {
          date: '2020-01-01',
          nodeId: 'nodeId1',
          status: 'STARTED',
          message: 'some message 1'
        },
        {
          date: '2020-01-01',
          nodeId: 'nodeId2',
          status: 'STARTED',
          message: 'some message 2'
        }
      ]
    }
  }
};

export const nodeStatusMock = {
  request: {
    query: NodeStatusSubscription
  },
  result: {
    data: {
      versionNodeStatus: {
        date: '2020/01/01',
        nodeId: 'node02',
        status: 'STARTED',
        message: 'some message'
      }
    }
  }
};

export const publishVersionMock = {
  request: {
    query: PublishVersionMutation
  },
  result: {
    data: {
      version
    }
  }
};

export const startVersionMock = {
  request: {
    query: StartVersionMutation
  },
  result: {
    data: {
      version
    }
  }
};

export const stopVersionMock = {
  request: {
    query: StopVersionMutation
  },
  result: {
    data: {
      version
    }
  }
};

export const unpublishVersionMock = {
  request: {
    query: UnpublishVersionMutation
  },
  result: {
    data: {
      version
    }
  }
};
