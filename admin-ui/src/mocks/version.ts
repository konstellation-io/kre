import { loader } from 'graphql.macro';
import { VersionStatus, RuntimeStatus } from '../graphql/types/globalTypes';

const GetConfigurationVariablesQuery = loader(
  '../graphql/queries/getConfigurationVariables.graphql'
);
const GetVersionWorkflowsQuery = loader(
  '../graphql/queries/getVersionWorkflows.graphql'
);
const NodeStatusSubscription = loader(
  '../graphql/subscriptions/versionNodeStatus.graphql'
);
const PublishVersionMutation = loader(
  '../graphql/mutations/publishVersion.graphql'
);
const StartVersionMutation = loader(
  '../graphql/mutations/startVersion.graphql'
);
const StopVersionMutation = loader('../graphql/mutations/stopVersion.graphql');
const UnpublishVersionMutation = loader(
  '../graphql/mutations/unpublishVersion.graphql'
);

export const runtime = {
  id: 'runtimeId',
  name: 'runtimeName',
  status: RuntimeStatus.STARTED,
  __typename: 'Runtime'
};
export const version = {
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
  configurationCompleted: true
};
export const confVarsMock = {
  request: {
    query: GetConfigurationVariablesQuery
  },
  result: {
    data: {
      version: {
        status: 'STARTED',
        configurationVariables: [
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
};

export const workflowsMock = {
  request: {
    query: GetVersionWorkflowsQuery
  },
  result: {
    data: {
      version: {
        name: 'version01',
        status: 'STARTED',
        configurationCompleted: true,
        workflows: [
          {
            name: 'workflow01',
            nodes: [
              {
                id: 'node01',
                name: 'one node',
                status: 'STARTED'
              },
              {
                id: 'node02',
                name: 'another node',
                status: 'STARTED'
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
