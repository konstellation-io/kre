import React, { useRef, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import VersionNode, { STATUS, TYPES } from '../Shape/Node/Node';

import { select, event } from 'd3-selection';
import { scaleBand, scaleOrdinal, ScaleBand } from 'd3-scale';
import { max, range } from 'd3-array';
import { zoom } from 'd3-zoom';
import { wrap, centerText } from '../../utils/d3';

import styles from './VersionStatusViewer.module.scss';

const MARGIN_WORKFLOW_NAMES = 0;
const DEFAULT_NODE_WIDTH = 120.33;
const DEFAULT_NODE_HEIGHT = 37.9;

type Node = {
  id: string;
  name: string;
  status: string;
  type: string;
};

type Edge = {
  id: string;
  name: string;
  status: string;
  value: number;
  from: string;
  to: string;
};

type Workflow = {
  name: string;
  nodes: Node[];
  edges: Edge[];
};

type Props = {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  data: Workflow[];
};

function getNodeTextPadding(type: string) {
  switch (type) {
    case TYPES.INPUT:
      return 45;
    case TYPES.OUTPUT:
      return 15;
    default:
      return 30;
  }
}

function VersionStatusViewer({ width, height, margin, data }: Props) {
  const container = useRef(null);
  const svg = useRef(null);

  const nodeIdToIndex: any = {};
  let g: any;
  let workflows: any;
  let nodes: any;
  let edges: any;
  let xScale: ScaleBand<string>;
  let yScale;

  const marginLeft = MARGIN_WORKFLOW_NAMES + margin.left;
  const innerWidth = width - marginLeft - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxNodesInRow = max(data, d => d.nodes.length) || 0;
  const xDomainIndexes = range(maxNodesInRow).map(n => n.toString());
  const workflowNames = data.map(d => d.name);

  useEffect(() => {
    cleanup();
    initialize();
  }, [width, height]);

  function cleanup() {
    select(svg.current)
      .selectAll('*')
      .remove();
    // TODO: remove tooltip
    // select(svg.current.parentNode).selectAll('div').remove();
  }

  function buildNodeIdToIndex() {
    data.forEach((workflow: Workflow) =>
      workflow.nodes.forEach(
        (node: Node, idx: number) => (nodeIdToIndex[node.id] = idx)
      )
    );
  }

  function initialize() {
    const svgSelection = select(svg.current);

    g = svgSelection
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    buildNodeIdToIndex();

    // Add zoom
    const zoomed = () => g.attr('transform', event.transform);
    const zoomFunc = zoom()
      .scaleExtent([0.5, 7])
      .on('zoom', zoomed);
    // @ts-ignore
    svgSelection.call(zoomFunc);

    // Initialize scales
    xScale = scaleBand()
      .range([marginLeft, marginLeft + innerWidth])
      .padding(0.4)
      .domain(xDomainIndexes);

    yScale = scaleOrdinal()
      .range([margin.top, margin.top + innerHeight])
      .domain(workflowNames);

    // Initialize workflows
    workflows = g
      .selectAll(`.${styles.workflow}`)
      .data(data)
      .enter()
      .append('g')
      .classed(styles.workflow, true)
      .attr(
        'transform',
        (d: Workflow, idx: number) => `translate(0,${idx * 100})`
      );

    // Initialize nodes
    const nodeWidth = xScale.bandwidth();
    const nodeSizeRatio = nodeWidth / DEFAULT_NODE_WIDTH;
    const fontSize = nodeWidth / 21;
    nodes = workflows
      .selectAll(`.${styles.node}`)
      .data((d: Workflow) => d.nodes)
      .enter()
      .append('g')
      .classed(styles.node, true)
      .attr(
        'transform',
        (d: Node, idx: number) => `translate(${xScale(idx.toString())}, 50)`
      )
      .each(function(d: Node) {
        // @ts-ignore
        select(this)
          .append('g')
          .attr('transform', 'translate(0, 0)')
          .html(
            ReactDOMServer.renderToString(
              <VersionNode
                type={d.type}
                width={nodeWidth}
                height={DEFAULT_NODE_HEIGHT * nodeSizeRatio}
                status={STATUS.ACTIVE}
              />
            )
          );
      });
    nodes
      .append('text')
      .classed(styles.nodeText, true)
      .attr('x', (d: Node) => getNodeTextPadding(d.type) * nodeSizeRatio)
      .attr('y', 0)
      .attr('dy', 0)
      .style('font-size', fontSize)
      .text((d: Node) => d.name)
      .call(wrap, 47 * nodeSizeRatio)
      .call(centerText, nodeSizeRatio);

    // Initialize edges

    // edges = workflows.selectAll(`.${styles.edge}`)
    //   .data((d:Workflow) => d.edges)
    //   .enter().append('g')
    //     .classed(styles.edge, true)
    //     .attr('transform', 'translate(0, 50)');
    // edges.append('line')
    //   .attr('x1', (d:Edge) => xScale(nodeIdToIndex[d.from]) || 0 + nodeWidth)
    //   .attr('x1', (d:Edge) => xScale(nodeIdToIndex[d.to]))
    //   .attr('y1', DEFAULT_NODE_HEIGHT * nodeSizeRatio / 2)
    //   .attr('y2', DEFAULT_NODE_HEIGHT * nodeSizeRatio / 2)
    //   .attr('stroke', 'red');
  }

  return (
    <div className={styles.container} ref={container}>
      <svg width={width} height={height} ref={svg} className={styles.wrapper} />
      VersionStatusViewer
    </div>
  );
}

export default VersionStatusViewer;
