import React, { useCallback, useEffect, useRef } from 'react';
import { forceLink, forceManyBody } from 'd3-force'
import { ForceGraph2D } from "react-force-graph";
import { ForceGraphMethods } from "react-force-graph-2d";
import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';
import { GetVersionWorkflows_version_workflows } from 'Graphql/queries/types/GetVersionWorkflows';
import styles from './BranchedWorkflowChart.module.scss';
import { drawNode } from "./canvas/drawNode";
import {getGraphData, getMaxNodesSubs, isEntrypoint, isNodeStarted, NodeWithStatus} from "./nodes/nodeUtils";

type Props = {
  workflow: GetVersionWorkflows_version_workflows;
  width: number;
  height: number;
  workflowStatus: VersionStatus;
  entrypointStatus: NodeStatus;
  entrypointAddress: string;
  onInnerNodeClick: Function;
  onInputNodeClick: Function;
  enableNodeClicks: boolean;
};

function BranchedWorkflowChart({
  workflow,
  width,
  height,
  entrypointStatus,
  onInnerNodeClick,
  onInputNodeClick,
}: Props) {
  if (!workflow) {
    return <div></div>;
  }

  const maxNodesSubs = getMaxNodesSubs(workflow?.nodes);
  const myGraphRef = useRef<ForceGraphMethods>();

  console.log(workflow)

  useEffect(() => {
    myGraphRef.current?.d3Force('link', forceLink().distance(maxNodesSubs > 1 ? 90 / maxNodesSubs: 40));
    myGraphRef.current?.d3Force('charge', forceManyBody().strength(-50*maxNodesSubs));
    }, []
  );

  return (
      <ForceGraph2D
        ref={myGraphRef}
        graphData={getGraphData(workflow, entrypointStatus)}
        linkColor={({source, target}) => (
          isNodeStarted(source as NodeWithStatus) && isNodeStarted(target as NodeWithStatus)
            ? styles.colorStatusStarted
            : styles.colorStatusStopped
        )}
        nodeId={"name"}
        linkWidth={() => 0.4}
        linkLineDash={() => [2, 2]}
        nodeRelSize={10}
        height={height}
        width={width}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node) => {
          const nodeName = (node as NodeWithStatus).name
          if (isEntrypoint(node as NodeWithStatus)) {
            onInputNodeClick();
            return;
          }
          onInnerNodeClick(nodeName);
        }}
        nodeCanvasObject={useCallback((node, ctx) => {
          drawNode(node, ctx, workflow);
          }, [])}
      />
  );
}

export default BranchedWorkflowChart;
