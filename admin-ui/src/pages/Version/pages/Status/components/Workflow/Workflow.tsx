import React, { useRef } from 'react';
import styles from './Workflow.module.scss';
import WorkflowHeader from './WorkflowHeader';
import WorkflowChart from './WorkflowChart';
import useRenderOnResize from '../../../../../../hooks/useRenderOnResize';
import { cloneDeep, capitalize } from 'lodash';

import {
  GetVersionWorkflows_version_workflows,
  GetVersionWorkflows_version_workflows_nodes,
  GetVersionWorkflows_version_workflows_edges
} from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import {
  NodeStatus,
  VersionStatus
} from '../../../../../../graphql/types/globalTypes';
import { TYPES } from '../../../../../../components/Shape/Node/Node';

export interface Node extends GetVersionWorkflows_version_workflows_nodes {
  type?: TYPES;
}
export interface Edge extends GetVersionWorkflows_version_workflows_edges {
  status?: NodeStatus;
}
interface Workflow extends GetVersionWorkflows_version_workflows {
  nodes: Node[];
  edges: Edge[];
}
type NodeTypes = 'INPUT' | 'OUTPUT';

export function formatData(
  workflow: GetVersionWorkflows_version_workflows,
  idx: number,
  versionStatus?: VersionStatus
): Workflow {
  function getNode(type: NodeTypes, status: NodeStatus): Node {
    return {
      __typename: 'Node',
      id: `W${idx}${capitalize(type)}Node`,
      name: `DATA ${type}`,
      status,
      type: TYPES[type]
    };
  }

  function getEdge(id: string, toNode: string): Edge {
    return {
      __typename: 'Edge',
      id,
      status: NodeStatus.STOPPED,
      fromNode: `W${idx}InputNode`,
      toNode
    };
  }

  let workflowCopy: Workflow = cloneDeep(workflow);
  workflowCopy.nodes = workflowCopy.nodes.map((node: Node) => ({
    ...node,
    status: NodeStatus.STOPPED
  }));

  const inoutNodeStatus: NodeStatus =
    versionStatus === VersionStatus.PUBLISHED
      ? NodeStatus.STARTED
      : NodeStatus.STOPPED;

  // workflowCopy.nodes.unshift(getNode('INPUT', inoutNodeStatus));
  // workflowCopy.nodes.push(getNode('OUTPUT', inoutNodeStatus));
  // workflowCopy.edges.push(getEdge('InputEdge', workflowCopy.nodes[1].id));
  // workflowCopy.edges.push(getEdge('OutputEdge', `W${idx}OutputNode`));

  return workflowCopy;
}

type Props = {
  workflow: GetVersionWorkflows_version_workflows;
  idx: number;
};

function Workflow({ workflow, idx }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const dimensions = useRenderOnResize({ container });

  const { width, height } = dimensions;

  return (
    <div className={styles.workflowContainer}>
      <WorkflowHeader />
      <div ref={container} className={styles.chartContainer}>
        <WorkflowChart
          width={width}
          height={height}
          data={formatData(workflow, idx)}
        />
      </div>
    </div>
  );
}

export default Workflow;
