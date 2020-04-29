import React, { useRef, useEffect } from 'react';
import WorkflowViz from './WorkflowViz';
import { GetVersionWorkflows_version_workflows } from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import { VersionStatus } from '../../../../../../graphql/types/globalTypes';
import { TooltipRefs } from '../WorkflowsManager/WorkflowsManager';

type Props = {
  data: GetVersionWorkflows_version_workflows;
  width: number;
  height: number;
  workflowStatus: VersionStatus;
  onInnerNodeClick: Function;
  tooltipRefs: TooltipRefs;
  disableNodeClicks: boolean;
};

function WorkflowChart({
  data,
  width,
  height,
  workflowStatus,
  onInnerNodeClick,
  tooltipRefs,
  disableNodeClicks
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
        tooltipRefs,
        disableNodeClicks,
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
