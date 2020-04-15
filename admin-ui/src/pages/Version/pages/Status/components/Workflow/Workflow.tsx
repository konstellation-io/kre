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
import { useApolloClient } from '@apollo/react-hooks';
import { LogPanel } from '../../../../../../graphql/client/typeDefs';
import { useParams } from 'react-router-dom';
import { RuntimeRouteParams } from '../../../../../../constants/routes';

export type Node = GetVersionWorkflows_version_workflows_nodes;
export interface Edge extends GetVersionWorkflows_version_workflows_edges {
  status?: NodeStatus;
}
interface Workflow extends GetVersionWorkflows_version_workflows {
  nodes: Node[];
  edges: Edge[];
}

const BASE_WIDTH = 323;
const NODE_WIDTH = 160;

type Props = {
  workflow: GetVersionWorkflows_version_workflows;
  workflowStatus: VersionStatus;
};

function Workflow({ workflow, workflowStatus }: Props) {
  const client = useApolloClient();
  const { runtimeId } = useParams<RuntimeRouteParams>();

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const dimensions = useRenderOnResize({ container: chartRef });

  // Sets container width.
  useEffect(() => {
    setContainerWidth(BASE_WIDTH + workflow.nodes.length * NODE_WIDTH);
  }, [setContainerWidth, workflow.nodes]);

  function setCurrentLogPanel(input: LogPanel) {
    client.writeData({
      data: { logPanel: input, logsOpened: true }
    });
  }

  function onInnerNodeClick(
    nodeId: string,
    nodeName: string,
    workflowId: string
  ) {
    setCurrentLogPanel({
      runtimeId,
      nodeId,
      nodeName,
      workflowId,
      __typename: 'logPanel'
    });
  }

  function onWorkflowClick(workflowId: string) {
    setCurrentLogPanel({
      runtimeId,
      nodeId: '',
      nodeName: '',
      workflowId,
      __typename: 'logPanel'
    });
  }

  const data = cloneDeep(workflow);
  const { width, height } = dimensions;

  return (
    <div className={styles.workflowContainer} style={{ width: containerWidth }}>
      <WorkflowHeader
        id={data.id}
        name={workflow.name}
        status={workflowStatus}
        onWorkflowClick={onWorkflowClick}
      />
      <div ref={chartRef} className={styles.chartContainer}>
        <WorkflowChart
          width={width}
          height={height}
          data={data}
          workflowStatus={workflowStatus}
          onInnerNodeClick={onInnerNodeClick}
        />
      </div>
    </div>
  );
}

export default Workflow;
