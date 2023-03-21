import React, { useRef } from 'react';
import {checkPermission} from 'rbac-rules';
import {cloneDeep} from 'lodash';
import cx from 'classnames';
import {
  GetVersionWorkflows_version_workflows,
  GetVersionWorkflows_version_workflows_nodes
} from 'Graphql/queries/types/GetVersionWorkflows';
import {NodeSelection} from 'Graphql/client/typeDefs';
import useLogs from 'Graphql/hooks/useLogs';
import {NodeStatus, VersionStatus} from 'Graphql/types/globalTypes';
import useUserAccess from 'Hooks/useUserAccess';
import {NODE_NAME_ENTRYPOINT} from 'Hooks/useWorkflowsAndNodes';
import WorkflowHeader from './WorkflowHeader';
import styles from './Workflow.module.scss';
import {getWorkflowState} from '../../states';
import BranchedWorkflowChart from '../BranchedWorkflowChart/BranchedWorkflowChart';

export type Node = GetVersionWorkflows_version_workflows_nodes;
interface Workflow extends GetVersionWorkflows_version_workflows {
  nodes: Node[];
}

const BASE_WIDTH = 1000;
const BASE_HEIGHT = 500;

const ENTRYPOINT_SELECTION = {
  workflowName: '',
  nodeNames: [NODE_NAME_ENTRYPOINT],
  __typename: 'NodeSelection'
};

type Props = {
  workflow: GetVersionWorkflows_version_workflows;
  workflowStatus: VersionStatus;
  entrypointStatus: NodeStatus;
  entrypointAddress: string;
};

function Workflow({
  workflow,
  workflowStatus,
  entrypointStatus,
  entrypointAddress,
}: Props) {
  const { createLogsTab } = useLogs();
  const { accessLevel } = useUserAccess();
  const chartRef = useRef<HTMLDivElement>(null);

  function createTab(nodes: NodeSelection[]) {
    createLogsTab(nodes);
  }

  function onInputNodeClick() {
    createTab([ENTRYPOINT_SELECTION]);
  }

  function onInnerNodeClick(nodeName: string) {
    createTab([
      {
        workflowName: workflow.name,
        nodeNames: [nodeName],
        __typename: 'NodeSelection'
      }
    ]);
  }

  function onWorkflowClick() {
    createTab([
      {
        workflowName: workflow.name,
        nodeNames: workflow.nodes.map(({ name }) => name),
        __typename: 'NodeSelection'
      },
      ENTRYPOINT_SELECTION
    ]);
  }

  const data = cloneDeep(workflow);
  const status = getWorkflowState(workflowStatus, data.nodes, entrypointStatus);

  return (
    <div
      className={cx(styles.workflowContainer, styles[status])}
      style={{ width: BASE_WIDTH, height: BASE_HEIGHT }}
    >
      <WorkflowHeader name={workflow.name} onWorkflowClick={onWorkflowClick} />
      <div ref={chartRef} className={styles.chartContainer}>
        <BranchedWorkflowChart
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          workflow={workflow}
          workflowStatus={workflowStatus}
          entrypointStatus={entrypointStatus}
          entrypointAddress={entrypointAddress}
          onInnerNodeClick={onInnerNodeClick}
          onInputNodeClick={onInputNodeClick}
          enableNodeClicks={checkPermission(accessLevel, 'logs:view')}
        />
      </div>
    </div>
  );
}

export default Workflow;
