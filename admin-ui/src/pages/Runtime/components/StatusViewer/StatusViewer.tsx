import { cloneDeep, get } from 'lodash';

import React, { useRef, useState, useEffect } from 'react';
import { useSubscription } from '@apollo/react-hooks';
import { useParams } from 'react-router';

import useRenderOnResize from '../../../../hooks/useRenderOnResize';
import { TYPES } from '../../../../components/Shape/Node/Node';
import { NodeStatus, VersionStatus } from '../../../../graphql/models';
import { NODE_STATUS_UPDATE_SUBSCRIPTION } from './StatusViewer.graphql';
import { VersionNodeStatus, Node } from '../../../../graphql/models';

import VersionStatusViewer, {
  Workflow
} from '../../../../components/VersionStatusViewer/VersionStatusViewer';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';

import styles from './StatusViewer.module.scss';

function formatData(workflows: any, versionStatus: VersionStatus) {
  let formattedData = cloneDeep(workflows);

  formattedData = formattedData.map((workflow: any, idx: number) => {
    workflow.nodes = workflow.nodes.map((node: Node) => ({
      ...node,
      status: NodeStatus.STOPPED
    }));

    const inoutNodeStatus =
      versionStatus === VersionStatus.ACTIVE
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

function StatusViewer({ data, status, onNodeClick }: any) {
  const { versionId } = useParams();

  const [workflows, setWorkflows] = useState<Workflow[]>(
    formatData(data, status)
  );
  useSubscription<VersionNodeStatus>(NODE_STATUS_UPDATE_SUBSCRIPTION, {
    variables: { versionId },
    onSubscriptionData: (msg: any) => {
      const nodeInfo = get(msg, 'subscriptionData.data.versionNodeStatus');
      const newNode: Node = {
        id: nodeInfo.nodeId,
        status: nodeInfo.status
      };

      setWorkflows(updateNodeStatus(workflows, newNode));
    }
  });

  const container = useRef(null);
  const dimensions = useRenderOnResize({ container });

  useEffect(() => {
    let newWorkflows = workflows;
    workflows.forEach((workflow: Workflow, idx: number) => {
      const newNodeState =
        status === VersionStatus.ACTIVE
          ? NodeStatus.STARTED
          : NodeStatus.STOPPED;
      const newInputNode = {
        id: `W${idx}InputNode`,
        status: newNodeState
      };
      const newOutputNode = {
        id: `W${idx}OutputNode`,
        status: newNodeState
      };

      newWorkflows = updateNodeStatus(newWorkflows, newInputNode);
      newWorkflows = updateNodeStatus(newWorkflows, newOutputNode);
    });

    setWorkflows(newWorkflows);
  }, [status]);

  const { width, height } = dimensions;

  return (
    <div ref={container} className={styles.container}>
      {data.length === 0 ? (
        <SpinnerCircular />
      ) : (
        <VersionStatusViewer
          width={width}
          height={height}
          margin={{
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          }}
          data={workflows}
          published={status === VersionStatus.ACTIVE}
          onNodeClick={onNodeClick}
        />
      )}
    </div>
  );
}

export default StatusViewer;
