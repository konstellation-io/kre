import React, { useRef, useEffect } from 'react';
import WorkflowViz from './WorkflowViz';
import { GetVersionWorkflows_version_workflows } from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import { VersionStatus } from '../../../../../../graphql/types/globalTypes';

type Props = {
  data: GetVersionWorkflows_version_workflows;
  width: number;
  height: number;
  workflowStatus: VersionStatus;
  onInnerNodeClick: Function;
};

function WorkflowChart({
  data,
  width,
  height,
  workflowStatus,
  onInnerNodeClick
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
      viz.current.update(data, workflowStatus);
    } else {
      initialize();
    }
  }

  return <svg width={width} height={height} ref={svg} />;
}

export default WorkflowChart;
