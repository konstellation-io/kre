import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';
import React, { useEffect, useRef } from 'react';

import { GetVersionWorkflows_version_workflows } from 'Graphql/queries/types/GetVersionWorkflows';
import { TooltipRefs } from '../WorkflowsManager/WorkflowsManager';
import WorkflowViz from './WorkflowViz';

type Props = {
  data: GetVersionWorkflows_version_workflows;
  width: number;
  height: number;
  workflowStatus: VersionStatus;
  entrypointStatus: NodeStatus;
  entrypointAddress: string;
  onInnerNodeClick: Function;
  onInputNodeClick: Function;
  tooltipRefs: TooltipRefs;
  enableNodeClicks: boolean;
};

function WorkflowChart({
  data,
  width,
  height,
  entrypointStatus,
  entrypointAddress,
  workflowStatus,
  onInnerNodeClick,
  onInputNodeClick,
  tooltipRefs,
  enableNodeClicks
}: Props) {
  const viz = useRef<WorkflowViz | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(initialize, [width, height]);
  useEffect(update, [data]);

  function initialize() {
    if (svg.current !== null && width * height !== 0) {
      const vizProps = {
        width,
        height,
        data,
        workflowStatus,
        entrypointStatus,
        entrypointAddress,
        onInnerNodeClick,
        onInputNodeClick,
        tooltipRefs,
        enableNodeClicks,
        margin: {
          top: 0,
          right: 20,
          bottom: 0,
          left: 5
        }
      };
      viz.current = new WorkflowViz(svg.current, vizProps);
    }
  }

  function update() {
    if (viz.current !== null) {
      viz.current.update(data, workflowStatus, entrypointStatus, tooltipRefs);
    } else {
      initialize();
    }
  }

  return <svg width={width} height={height} ref={svg} />;
}

export default WorkflowChart;
