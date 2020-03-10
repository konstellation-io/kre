import React from 'react';
import StatusViewer, {
  formatData,
  updateNodeStatus,
  getInOutNode
} from './StatusViewer';
import { workflowsMock, nodeStatusMock } from '../../../../mocks/version';
import {
  VersionStatus,
  NodeStatus
} from '../../../../graphql/types/globalTypes';
import { TYPES } from '../../../../components/Shape/Node/Node';
import { clone } from 'lodash';
import { MockedProvider } from '@apollo/react-testing';
import { prepareApolloComponent } from '../../../../utils/testUtilsEnzyme';
import VersionStatusViewer from '../../../../components/VersionStatusViewer/VersionStatusViewer';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';

const DATA_WORKFLOWS = workflowsMock.result.data.version.workflows;
const expectedDefaultResult = [
  {
    name: 'workflow01',
    nodes: [
      {
        id: 'W0InputNode',
        name: 'DATA INPUT',
        status: VersionStatus.STOPPED,
        type: TYPES.INPUT
      },
      {
        id: 'node01',
        name: 'one node',
        status: VersionStatus.STOPPED
      },
      {
        id: 'node02',
        name: 'another node',
        status: VersionStatus.STOPPED
      },
      {
        id: 'W0OutputNode',
        name: 'DATA OUTPUT',
        status: VersionStatus.STOPPED,
        type: TYPES.OUTPUT
      }
    ],
    edges: [
      {
        id: 'edge01',
        fromNode: 'node01',
        toNode: 'node02'
      },
      {
        id: 'InputEdge',
        status: VersionStatus.STOPPED,
        fromNode: `W0InputNode`,
        toNode: 'node01'
      },
      {
        id: 'OutputEdge',
        status: VersionStatus.STOPPED,
        fromNode: `node02`,
        toNode: 'W0OutputNode'
      }
    ]
  }
];

describe('test formatData', () => {
  it('works with empty input', () => {
    const workflows = [];
    const result = formatData(workflows);
    expect(result).toStrictEqual(workflows);
  });
  it('works with standard input', () => {
    const result = formatData(DATA_WORKFLOWS);

    expect(result).toStrictEqual(expectedDefaultResult);
  });
  it('works with standard input and version status', () => {
    const result = formatData(DATA_WORKFLOWS, VersionStatus.PUBLISHED);
    const expectedResult = clone(expectedDefaultResult);
    expectedResult[0].nodes[0].status = VersionStatus.STARTED;
    expectedResult[0].nodes[3].status = VersionStatus.STARTED;
    expectedResult[0].edges[1].status = VersionStatus.STARTED;
    expectedResult[0].edges[2].status = VersionStatus.STARTED;

    expect(result).toStrictEqual(expectedResult);
  });
});

describe('test updateNodeStatus', () => {
  const newNode = {
    id: 'node02',
    status: VersionStatus.STARTED
  };
  it('works with empty workflows', () => {
    const workflows = [];
    const result = updateNodeStatus(workflows, newNode);

    expect(result).toStrictEqual(workflows);
  });
  it('updates the status of a node', () => {
    const result = updateNodeStatus(DATA_WORKFLOWS, newNode);
    const expectedResult = clone(DATA_WORKFLOWS);
    expectedResult[0].nodes[1].status = VersionStatus.STARTED;

    expect(result).toStrictEqual(expectedResult);
  });
  it('do not update the status when the node is wrong', () => {
    const unexistentNode = {
      id: 'node08',
      status: VersionStatus.STARTED
    };
    const result = updateNodeStatus(DATA_WORKFLOWS, unexistentNode);

    expect(result).toStrictEqual(DATA_WORKFLOWS);
  });
});

describe('test getInOutNode', () => {
  it('returns an STOPPED input/output node', () => {
    let result = getInOutNode('someId', VersionStatus.STARTED);
    let expectedResult = {
      id: 'someId',
      status: NodeStatus.STOPPED
    };

    expect(result).toStrictEqual(expectedResult);

    result = getInOutNode('someId2', VersionStatus.STOPPED);
    expectedResult = {
      id: 'someId2',
      status: NodeStatus.STOPPED
    };

    expect(result).toStrictEqual(expectedResult);
  });
  it('returns an STARTED input/output node', () => {
    const result = getInOutNode('someId', VersionStatus.PUBLISHED);
    const expectedResult = {
      id: 'someId',
      status: NodeStatus.STARTED
    };

    expect(result).toStrictEqual(expectedResult);
  });
});

describe('test StatusViewer', () => {
  const mocks = [workflowsMock, nodeStatusMock, nodeStatusMock];
  function Wrapper(props) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        <StatusViewer data={DATA_WORKFLOWS} {...props} />
      </MockedProvider>
    );
  }

  it('has right components', async () => {
    const { wrapper } = await prepareApolloComponent(<Wrapper />);

    expect(wrapper.exists(VersionStatusViewer)).toBeTruthy();
  });

  it('shows a loader when there is no data', async () => {
    const { wrapper } = await prepareApolloComponent(<Wrapper data={[]} />);

    expect(wrapper.exists(SpinnerCircular)).toBeTruthy();
  });
  it('updates workflows on subscription', async () => {
    const { wrapper } = await prepareApolloComponent(<Wrapper />);
    const updatedNode = wrapper.find(VersionStatusViewer).prop('data')[0]
      .nodes[2];

    expect(updatedNode.status).toBe('STARTED');
  });
});
