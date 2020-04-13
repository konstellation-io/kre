import React, { useRef, useState, useEffect } from 'react';
import styles from './Workflow.module.scss';
import WorkflowHeader from './WorkflowHeader';
import WorkflowChart from './WorkflowChart';
import useRenderOnResize from '../../../../../../hooks/useRenderOnResize';
import { cloneDeep } from 'lodash';

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

export function formatData(
  workflow: GetVersionWorkflows_version_workflows,
  idx: number,
  versionStatus?: VersionStatus
): Workflow {
  let workflowCopy: Workflow = cloneDeep(workflow);
  workflowCopy.nodes = workflowCopy.nodes.map((node: Node) => ({
    ...node,
    status: NodeStatus.STOPPED
  }));

  return workflowCopy;
}

const BASE_WIDTH = 323;
const NODE_WIDTH = 160;

type Props = {
  workflow: GetVersionWorkflows_version_workflows;
  idx: number;
  workflowStatus: VersionStatus;
};

function Workflow({ workflow, idx, workflowStatus }: Props) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const dimensions = useRenderOnResize({ container: chartRef });

  // Sets container width.
  useEffect(() => {
    setContainerWidth(BASE_WIDTH + workflow.nodes.length * NODE_WIDTH);
  }, []);

  const data = formatData(workflow, idx);
  const { width, height } = dimensions;

  return (
    <div className={styles.workflowContainer} style={{ width: containerWidth }}>
      <WorkflowHeader name={workflow.name} status={workflowStatus} />
      <div ref={chartRef} className={styles.chartContainer}>
        <WorkflowChart
          width={width}
          height={height}
          data={data}
          workflowStatus={workflowStatus}
        />
      </div>
    </div>
  );
}

export default Workflow;
