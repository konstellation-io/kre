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
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import {
  RuntimeRouteParams,
  VersionRouteParams
} from '../../../../../../constants/routes';
import { GET_OPENED_VERSION_INFO } from '../../../../../../graphql/client/queries/getOpenedVersionInfo.graphql';
import { TooltipRefs } from '../WorkflowsManager/WorkflowsManager';
import { getWorkflowState } from '../../states';
import cx from 'classnames';
import useUserAccess from '../../../../../../hooks/useUserAccess';
import { checkPermission } from '../../../../../../rbac-rules';
import { NodeSelection } from '../../../../../../graphql/client/typeDefs';
import {
  ADD_LOG_TAB,
  AddLogTabVariables
} from '../../../../../../graphql/client/mutations/addLogTab.graphql';
import { NODE_NAME_ENTRYPOINT } from '../../../../../../hooks/useWorkflowsAndNodes';

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
  tooltipRefs: TooltipRefs;
};

function Workflow({ workflow, workflowStatus, tooltipRefs }: Props) {
  const { accessLevel } = useUserAccess();
  const { versionId } = useParams<VersionRouteParams>();
  const { data: localData } = useQuery(GET_OPENED_VERSION_INFO);
  const runtimeName = localData?.openedVersion.runtimeName || '';
  const versionName = localData?.openedVersion.versionName || '';
  const { runtimeId } = useParams<RuntimeRouteParams>();
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const dimensions = useRenderOnResize({ container: chartRef });

  const [addLogTabMutation] = useMutation<null, AddLogTabVariables>(
    ADD_LOG_TAB
  );

  // Sets container width.
  useEffect(() => {
    setContainerWidth(BASE_WIDTH + workflow.nodes.length * NODE_WIDTH);
  }, [setContainerWidth, workflow.nodes]);

  function addLogTab(nodes: NodeSelection[]) {
    addLogTabMutation({
      variables: {
        input: {
          runtimeId,
          runtimeName,
          versionId,
          versionName,
          nodes
        }
      }
    });
  }

  function onInputNodeClick() {
    addLogTab([
      {
        workflowName: '',
        nodeNames: [NODE_NAME_ENTRYPOINT],
        __typename: 'NodeSelection'
      }
    ]);
  }

  function onInnerNodeClick(nodeName: string) {
    addLogTab([
      {
        workflowName: workflow.name,
        nodeNames: [nodeName],
        __typename: 'NodeSelection'
      }
    ]);
  }

  function onWorkflowClick() {
    addLogTab([
      {
        workflowName: workflow.name,
        nodeNames: workflow.nodes.map(({ name }) => name),
        __typename: 'NodeSelection'
      }
    ]);
  }

  const data = cloneDeep(workflow);
  const { width, height } = dimensions;
  const status = getWorkflowState(workflowStatus, data.nodes);

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
