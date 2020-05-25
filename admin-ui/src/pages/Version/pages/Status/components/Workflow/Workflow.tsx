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
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import {
  RuntimeRouteParams,
  VersionRouteParams
} from '../../../../../../constants/routes';
import { GET_LOG_TABS } from '../../../../../../graphql/client/queries/getLogs.graphql';
import { GET_OPENED_VERSION_INFO } from '../../../../../../graphql/client/queries/getOpenedVersionInfo.graphql';
import { TooltipRefs } from '../WorkflowsManager/WorkflowsManager';
import { getWorkflowState } from '../../states';
import cx from 'classnames';
import useUserAccess from '../../../../../../hooks/useUserAccess';
import { checkPermission } from '../../../../../../rbac-rules';
import { getDefaultFilters } from '../../../../../../graphql/client/resolvers/updateTabFilters';

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

type logTabMainFilters = {
  nodeId?: string;
  nodeName: string;
  workflowId: string;
};

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

  const client = useApolloClient();
  const { runtimeId } = useParams<RuntimeRouteParams>();

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const dimensions = useRenderOnResize({ container: chartRef });

  // Sets container width.
  useEffect(() => {
    setContainerWidth(BASE_WIDTH + workflow.nodes.length * NODE_WIDTH);
  }, [setContainerWidth, workflow.nodes]);

  function addLogTab(filters: logTabMainFilters) {
    const logTabs = client.readQuery({
      query: GET_LOG_TABS
    });
    const activeTabId = `${Date.now()}`;
    client.writeData({
      data: {
        logsOpened: true,
        activeTabId,
        logTabs: [
          ...logTabs.logTabs,
          {
            runtimeId,
            runtimeName,
            versionId,
            versionName,
            uniqueId: activeTabId,
            filters: {
              ...getDefaultFilters(),
              ...filters
            },
            __typename: 'logTab'
          }
        ]
      }
    });
  }

  function onInnerNodeClick(
    nodeId: string,
    nodeName: string,
    workflowId: string
  ) {
    addLogTab({
      nodeId,
      nodeName,
      workflowId
    });
  }

  function onWorkflowClick() {
    addLogTab({
      nodeId: '',
      nodeName: '',
      workflowId: data.id
    });
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
          tooltipRefs={tooltipRefs}
          enableNodeClicks={checkPermission(accessLevel, 'logs-page:visit')}
        />
      </div>
    </div>
  );
}

export default Workflow;
