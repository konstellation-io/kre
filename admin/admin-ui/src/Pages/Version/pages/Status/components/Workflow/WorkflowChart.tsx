import React, { useEffect, useRef } from 'react';

import { GetVersionWorkflows_version_workflows } from 'Graphql/queries/types/GetVersionWorkflows';
import { TooltipRefs } from '../WorkflowsManager/WorkflowsManager';
import { VersionStatus } from 'Graphql/types/globalTypes';
import WorkflowViz from './WorkflowViz';

type Props = {
  data: GetVersionWorkflows_version_workflows;
  width: number;
  height: number;
  workflowStatus: VersionStatus;
  onInnerNodeClick: Function;
  onInputNodeClick: Function;
  tooltipRefs: TooltipRefs;
  enableNodeClicks: boolean;
};

function WorkflowChart({
  data,
  width,
  height,
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
        onInnerNodeClick,
        onInputNodeClick,
        tooltipRefs,
        enableNodeClicks,
        margin: {
          right: 20,
          left: 5
        }
      };
      viz.current = new WorkflowViz(svg.current, vizProps);
    }
  }

  function update() {
    if (viz.current !== null) {
      viz.current.update(data, workflowStatus, tooltipRefs);
    } else {
      initialize();
    }
  }

  return <svg width={width} height={height} ref={svg} />;
}

export default WorkflowChart;
