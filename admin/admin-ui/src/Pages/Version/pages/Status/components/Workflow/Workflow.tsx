import {
  GetVersionWorkflows_version_workflows,
  GetVersionWorkflows_version_workflows_edges,
  GetVersionWorkflows_version_workflows_nodes
} from 'Graphql/queries/types/GetVersionWorkflows';
import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';
import React, { useEffect, useRef, useState } from 'react';
import { RuntimeRouteParams, VersionRouteParams } from 'Constants/routes';

import { GET_OPENED_VERSION_INFO } from 'Graphql/client/queries/getOpenedVersionInfo.graphql';
import { NODE_NAME_ENTRYPOINT } from 'Hooks/useWorkflowsAndNodes';
import { NodeSelection } from 'Graphql/client/typeDefs';
import { TooltipRefs } from '../WorkflowsManager/WorkflowsManager';
import WorkflowChart from './WorkflowChart';
import WorkflowHeader from './WorkflowHeader';
import { checkPermission } from 'rbac-rules';
import { cloneDeep } from 'lodash';
import cx from 'classnames';
import { getWorkflowState } from '../../states';
import styles from './Workflow.module.scss';
import useLogs from 'Graphql/hooks/useLogs';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import useRenderOnResize from 'Hooks/useRenderOnResize';
import useUserAccess from 'Hooks/useUserAccess';

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
  entrypointStatus: NodeStatus;
  entrypointAddress: string;
  tooltipRefs: TooltipRefs;
};

function Workflow({
  workflow,
  workflowStatus,
  entrypointStatus,
  entrypointAddress,
  tooltipRefs
}: Props) {
  const { createLogsTab } = useLogs();
  const { accessLevel } = useUserAccess();
  const { versionId } = useParams<VersionRouteParams>();
  const { data: localData } = useQuery(GET_OPENED_VERSION_INFO);
  const runtimeName = localData?.openedVersion.runtimeName || '';
  const versionName = localData?.openedVersion.versionName || '';
  const { runtimeId } = useParams<RuntimeRouteParams>();
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const dimensions = useRenderOnResize({ container: chartRef });

  // Sets container width.
  useEffect(() => {
    setContainerWidth(BASE_WIDTH + workflow.nodes.length * NODE_WIDTH);
  }, [setContainerWidth, workflow.nodes]);

  function createTab(node: NodeSelection) {
    createLogsTab({
      runtimeId,
      runtimeName,
      versionId,
      versionName,
      nodes: [node]
    });
  }

  function onInputNodeClick() {
    createTab({
      workflowName: '',
      nodeNames: [NODE_NAME_ENTRYPOINT],
      __typename: 'NodeSelection'
    });
  }

  function onInnerNodeClick(nodeName: string) {
    createTab({
      workflowName: workflow.name,
      nodeNames: [nodeName],
      __typename: 'NodeSelection'
    });
  }

  function onWorkflowClick() {
    createTab({
      workflowName: workflow.name,
      nodeNames: workflow.nodes.map(({ name }) => name),
      __typename: 'NodeSelection'
    });
  }

  const data = cloneDeep(workflow);
  const { width, height } = dimensions;
  const status = getWorkflowState(workflowStatus, data.nodes, entrypointStatus);

  return (
    <div
      className={cx(styles.workflowContainer, styles[status])}
      style={{ width: containerWidth }}
    >
      <WorkflowHeader name={workflow.name} onWorkflowClick={onWorkflowClick} />
      <div ref={chartRef} className={styles.chartContainer}>
        <WorkflowChart
          width={width}
          height={height}
          data={data}
          workflowStatus={workflowStatus}
          entrypointStatus={entrypointStatus}
          entrypointAddress={entrypointAddress}
          onInnerNodeClick={onInnerNodeClick}
          onInputNodeClick={onInputNodeClick}
          tooltipRefs={tooltipRefs}
          enableNodeClicks={checkPermission(accessLevel, 'logs:view')}
        />
      </div>
    </div>
  );
}

export default Workflow;
