import React, { useRef, useEffect } from 'react';
import WorkflowViz from './WorkflowViz';
import styles from './Workflow.module.scss';
import { GetVersionWorkflows_version_workflows } from '../../../../../../graphql/queries/types/GetVersionWorkflows';

type Props = {
  data: GetVersionWorkflows_version_workflows;
  width: number;
  height: number;
};

function WorkflowChart({ data, width, height }: Props) {
  const viz = useRef<WorkflowViz | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(initialize, [width, height]);
  useEffect(update, [data]);

  function initialize() {
    if (svg.current !== null) {
      const vizProps = {
        width,
        height,
        data
      };
      viz.current = new WorkflowViz(svg.current, vizProps);
    }
  }

  function update() {
    if (viz.current !== null) {
      viz.current.update();
    }
  }

  return <svg width={width} height={height} ref={svg} />;
}

export default WorkflowChart;
