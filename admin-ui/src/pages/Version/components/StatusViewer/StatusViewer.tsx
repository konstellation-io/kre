import { cloneDeep, get, isEqual } from 'lodash';

import React, { useEffect, useRef, useState } from 'react';
import { loader } from 'graphql.macro';
import { useSubscription } from '@apollo/react-hooks';
import { useParams } from 'react-router';

import useRenderOnResize from '../../../../hooks/useRenderOnResize';
import { TYPES } from '../../../../components/Shape/Node/Node';
import {
  VersionNodeStatus,
  VersionNodeStatusVariables
} from '../../../../graphql/subscriptions/types/VersionNodeStatus';
import {
  VersionStatus,
  NodeStatus
} from '../../../../graphql/types/globalTypes';

import VersionStatusViewer, {
  Workflow,
  Node
} from '../../../../components/VersionStatusViewer/VersionStatusViewer';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';

import styles from './StatusViewer.module.scss';
import { VersionRouteParams } from '../../../../constants/routes';

const VersionNodeStatusSubscription = loader(
  '../../../../graphql/subscriptions/versionNodeStatus.graphql'
);

function formatData(workflows: Workflow[], versionStatus: VersionStatus) {
  let formattedData = cloneDeep(workflows);

  formattedData = formattedData.map((workflow: any, idx: number) => {
    workflow.nodes = workflow.nodes.map((node: Node) => ({
      ...node,
      status: NodeStatus.STOPPED
    }));

    const inoutNodeStatus =
      versionStatus === VersionStatus.PUBLISHED
        ? NodeStatus.STARTED
        : NodeStatus.STOPPED;

    workflow.nodes.unshift({
      id: `W${idx}InputNode`,
      name: 'DATA INPUT',
      status: inoutNodeStatus,
      type: TYPES.INPUT
    });
    workflow.nodes.push({
      id: `W${idx}OutputNode`,
      name: 'DATA OUTPUT',
      status: inoutNodeStatus,
      type: TYPES.OUTPUT
    });
    workflow.edges.push({
      id: 'InputEdge',
      status: inoutNodeStatus,
      fromNode: `W${idx}InputNode`,
      toNode: workflow.nodes[1].id
    });
    workflow.edges.push({
      id: 'OutputEdge',
      status: inoutNodeStatus,
      fromNode: workflow.nodes[workflow.nodes.length - 2].id,
      toNode: `W${idx}OutputNode`
    });

    return workflow;
  });

  return formattedData;
}

function updateNodeStatus(workflows: Workflow[], newNode: Node): Workflow[] {
  let workflowsCopy: Workflow[] = cloneDeep(workflows);

  workflowsCopy.forEach((workflow: Workflow) => {
    workflow.nodes.forEach((node: Node) => {
      if (node.id === newNode.id) {
        node.status = newNode.status;
      }
    });
  });

  return workflowsCopy;
}

function getInOutStatus(status: VersionStatus): NodeStatus {
  return status === VersionStatus.PUBLISHED
    ? NodeStatus.STARTED
    : NodeStatus.STOPPED;
}
function getInOutNode(id: string, status: VersionStatus): Node {
  return {
    id,
    status: getInOutStatus(status)
  };
}

function StatusViewer({ data, status, onNodeClick }: any) {
  const { versionId } = useParams<VersionRouteParams>();

  const [workflows, setWorkflows] = useState<Workflow[]>(
    formatData(data, status)
  );
  const [nodesObtained, setNodesObtained] = useState<boolean>(false);
  const [nodesToUpdate, setNodesToUpdate] = useState<Node[]>([]);

  useSubscription<VersionNodeStatus, VersionNodeStatusVariables>(
    VersionNodeStatusSubscription,
    {
      variables: { versionId },
      onSubscriptionData: (msg: any) => {
        const nodeInfo = get(msg, 'subscriptionData.data.versionNodeStatus');
        const newNode: Node = {
          id: nodeInfo.nodeId,
          status: nodeInfo.status
        };

        // Add node to update queue
        setNodesToUpdate(nodesToUpdate.concat([newNode]));
      }
    }
  );

  const container = useRef(null);
  const prevParams = useRef<any>({
    data: undefined,
    status: undefined
  });
  const dimensions = useRenderOnResize({ container });

  useEffect(() => {
    function updateInOutNodes() {
      let newWorkflows = workflows;
      workflows.forEach((w: Workflow, idx: number) => {
        const newInputNode = getInOutNode(`W${idx}InputNode`, status);
        const newOutputNode = getInOutNode(`W${idx}OutputNode`, status);

        newWorkflows = updateNodeStatus(newWorkflows, newInputNode);
        newWorkflows = updateNodeStatus(newWorkflows, newOutputNode);
      });

      setWorkflows(newWorkflows);
    }

    if (!isEqual(data, prevParams.current.data)) {
      setWorkflows(formatData(data, status));
    } else if (prevParams.current.status !== status) {
      updateInOutNodes();
    }

    prevParams.current.data = data;
    prevParams.current.status = status;

    // Update nodes after the nodes info has been retrieved
    if (nodesObtained && nodesToUpdate.length !== 0) {
      let newWorkflows = workflows;
      while (nodesToUpdate.length !== 0) {
        const newNode: Node = nodesToUpdate.pop() as Node;
        newWorkflows = updateNodeStatus(newWorkflows, newNode);
      }

      setNodesToUpdate([]);
      setWorkflows(newWorkflows);
    } else if (!nodesObtained) {
      setNodesObtained(true);
    }
  }, [
    data,
    status,
    workflows,
    nodesToUpdate,
    setNodesToUpdate,
    nodesObtained,
    setNodesObtained
  ]);

  const { width, height } = dimensions;

  return (
    <div ref={container} className={styles.container}>
      {data.length === 0 ? (
        <SpinnerCircular />
      ) : (
        <VersionStatusViewer
          key={`versionStatus_${versionId}`}
          width={width}
          height={height}
          margin={{
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          }}
          data={workflows}
          published={status === VersionStatus.PUBLISHED}
          onNodeClick={onNodeClick}
          chartId={`status_${versionId}`}
        />
      )}
    </div>
  );
}

export default StatusViewer;
