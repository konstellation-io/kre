import React, { useEffect, useRef, useState } from 'react';
import useChart from '../../hooks/useChart';
import ReactDOMServer from 'react-dom/server';
import VersionNode, { TYPES } from '../Shape/Node/Node';

import { event, select, Selection } from 'd3-selection';
import { scaleBand, ScaleBand } from 'd3-scale';
import { max, range } from 'd3-array';
import { zoom } from 'd3-zoom';
import { centerText, wrap, getArrowD } from '../../utils/d3';

import styles from './VersionStatusViewer.module.scss';

import { NodeStatus } from '../../graphql/types/globalTypes';

const MARGIN_WORKFLOW_NAMES_PERC = 0.08;
const DEFAULT_NODE_WIDTH = 120.33;
const DEFAULT_NODE_HEIGHT = 37.9;
const STROKE_WIDTH_PERC = 0.035;
const ARROW_SIZE_PERC = 0.8;
const SCALE_PADDING_INNER = 0.4;
const SCALE_PADDING_OUTER = 0.1;

function cleanup(component: any) {
  select(component)
    .selectAll('*')
    .remove();
}

type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

function canBeRendered(
  width: number,
  height: number,
  margin?: Margin
): boolean {
  const horizontalMargin: number = (margin && margin.left + margin.right) || 0;
  const verticalMargin: number = (margin && margin.top + margin.bottom) || 0;
  const widthOk: boolean = width > 0 && width > horizontalMargin;
  const heightOk: boolean = height > 0 && height > verticalMargin;

  return widthOk && heightOk;
}

export type Node = {
  id: string;
  name?: string;
  status: NodeStatus;
  type?: string;
};

type Edge = {
  id: string;
  status?: string;
  fromNode: string;
  toNode: string;
};

export type Workflow = {
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
  published: boolean;
  onNodeClick: Function;
  chartId: string;
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

function setGroups(selection: any) {
  selection.enter = selection.group.enter();
  selection.exit = selection.group.exit();
}

function VersionStatusViewer({
  width,
  height,
  margin,
  data,
  published,
  onNodeClick,
  chartId
}: Props) {
  const { svg, chart } = useChart({
    width,
    height,
    initialize,
    removeUpdate: true
  });
  const [initialized, setInitialized] = useState<boolean>(false);

  const nodeIdToIndex: any = {};
  let g: Selection<SVGGElement, unknown, null, undefined>;
  let defs: Selection<SVGGElement, unknown, null, undefined>;
  let workflowsTag: any;
  let xScale: ScaleBand<string>;
  let fontSize: string;
  const ref = useRef<any>({
    workflowsG: null,
    workflows: {
      enter: null,
      exit: null,
      group: null
    },
    nodesG: null,
    nodes: {
      enter: null,
      exit: null,
      group: null
    },
    edgesG: null,
    edges: {
      enter: null,
      exit: null,
      group: null
    },
    nodeWidth: null,
    nodeSizeRatio: null,
    nodeHeight: null
  });

  const marginWorkflow = width * MARGIN_WORKFLOW_NAMES_PERC;
  const marginLeft = marginWorkflow + margin.left;
  const innerWidth = width - marginLeft - margin.right;

  const maxNodesInRow = max(data, d => d.nodes.length) || 0;
  const xDomainIndexes = range(maxNodesInRow).map(n => n.toString());

  useEffect(() => {
    initialized && updateChart();
  }, [data]);

  useEffect(() => {
    if (canBeRendered(width, height, margin)) {
      cleanup(svg.current);
      initialize();
      setInitialized(true);
    }
  }, [chartId, width, height]);

  function buildNodeIdToIndex() {
    data.forEach((workflow: Workflow) =>
      workflow.nodes.forEach(
        (node: Node, idx: number) => (nodeIdToIndex[node.id] = idx.toString())
      )
    );
  }

  function generateBlurFilter() {
    defs = select(svg.current).append('defs');

    const filter = defs.append('filter').attr('id', 'glow');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  function updateComponent(component: string): void {
    setData[component]();
    update[component]();
    create[component]();
  }

  function updateChart() {
    updateComponent('workflows');
    updateComponent('nodes');
    updateComponent('edges');
  }

  function initialize() {
    if (svg.current === null) {
      return;
    }

    const svgSelection = select(svg.current);

    g = svgSelection
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    generateBlurFilter();
    buildNodeIdToIndex();

    const zoomLimits: [[number, number], [number, number]] = [
      [-width / 4, -height / 4],
      [width * 1.25, height * 1.25]
    ];

    // Adds zoom
    const zoomed = () => g.attr('transform', event.transform);
    const zoomFunc = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 7])
      .translateExtent(zoomLimits)
      .on('zoom', zoomed);

    svgSelection.call(zoomFunc);

    // Initialize scales
    xScale = scaleBand()
      .range([marginLeft, marginLeft + innerWidth])
      .paddingInner(SCALE_PADDING_INNER)
      .paddingOuter(SCALE_PADDING_OUTER)
      .domain(xDomainIndexes);

    ref.current.nodeWidth = xScale.bandwidth();
    ref.current.nodeSizeRatio = ref.current.nodeWidth / DEFAULT_NODE_WIDTH;
    ref.current.nodeHeight = DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio;
    fontSize = (ref.current.nodeWidth / 21).toFixed(1);

    // Create workflows
    ref.current.workflowsG = g.append('g').classed(styles.workflows, true);
    setData.workflows();
    create.workflows();

    // Create workflows tag
    create.workflowTags();

    // Create nodes/edges groups
    ref.current.nodesG = ref.current.workflows.enter
      .append('g')
      .classed(styles.nodesG, true)
      .attr('transform', 'translate(0, 50)');
    ref.current.edgesG = ref.current.workflows.enter
      .append('g')
      .classed(styles.edgesG, true)
      .attr('transform', 'translate(0, 50)');

    // Create nodes
    setData.nodes();
    create.nodes();

    // Create edges
    setData.edges();
    create.edges();
  }

  const setData: { [key: string]: Function } = {
    workflows: function() {
      ref.current.workflows.group = ref.current.workflowsG
        .selectAll(`.${styles.workflow}`)
        .data(data);
      setGroups(ref.current.workflows);
    },
    nodes: function() {
      ref.current.nodes.group = ref.current.nodesG
        .selectAll(`.${styles.node}`)
        .data((d: Workflow) => d.nodes);
      setGroups(ref.current.nodes);
    },
    edges: function() {
      ref.current.edges.group = ref.current.edgesG
        .selectAll(`.${styles.edge}`)
        .data((d: Workflow) => d.edges);
      setGroups(ref.current.edges);
    }
  };

  const create: { [key: string]: Function } = {
    workflows: function() {
      ref.current.workflows.enter = ref.current.workflows.enter
        .append('g')
        .classed(styles.workflow, true)
        .attr(
          'transform',
          (d: Workflow, idx: number) => `translate(0,${idx * 100})`
        );
    },
    node: function(container: SVGGElement, d: Node) {
      select(container)
        .append('g')
        .attr('transform', 'translate(0, 0)')
        .html(
          ReactDOMServer.renderToString(
            <VersionNode
              type={d.type || TYPES.DEFAULT}
              width={ref.current.nodeWidth}
              height={DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio}
              status={d.status}
            />
          )
        );
    },
    nodes: function() {
      const nodesContainer = ref.current.nodes.enter
        .append('g')
        .attr('id', (d: Node) => `node_${d.id}`)
        .classed(styles.node, true)
        .attr(
          'transform',
          (d: Node, idx: number) => `translate(${xScale(idx.toString())}, 0)`
        )
        .on('mouseenter', (d: Node) => events.nodeHighlight(d, true))
        .on('mouseleave', (d: Node) => events.nodeHighlight(d, false))
        .on('click', (d: Node) => {
          onNodeClick(d.id, d.name);
          events.nodeHighlight(d, false);
        })
        .each(function(d: Node) {
          create.node(this, d);
        });
      nodesContainer
        .append('text')
        .classed('nodeText', true)
        .classed(styles.nodeText, true)
        .attr(
          'x',
          (d: Node) =>
            getNodeTextPadding(d.type || TYPES.DEFAULT) *
            ref.current.nodeSizeRatio
        )
        .attr('y', (DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio) / 2)
        .attr('dy', 0)
        .style('font-size', `${fontSize}px`)
        .text((d: Node) => d.name)
        .call(wrap, 47 * ref.current.nodeSizeRatio)
        .call(centerText, fontSize);
    },
    workflowTags: function() {
      workflowsTag = ref.current.workflows.enter
        .append('g')
        .attr('transform', `translate(0, 50)`)
        .classed(styles.published, published)
        .classed(styles.workflowTag, true);
      workflowsTag
        .append('text')
        .classed(styles.workflowTagText, true)
        .attr('x', marginWorkflow - 10)
        .attr('y', ref.current.nodeHeight / 2)
        .attr('dy', 0)
        .style('font-size', `${fontSize}px`)
        .text((d: Workflow) => d.name)
        .call(centerText, fontSize);
      workflowsTag
        .append('line')
        .attr('x1', marginWorkflow)
        .attr('x2', marginWorkflow)
        .attr('y1', 2.5)
        .attr('y2', -2.5 + ref.current.nodeHeight)
        .attr('stroke-width', ref.current.nodeHeight * STROKE_WIDTH_PERC);
      workflowsTag
        .append('line')
        .attr('x1', marginWorkflow)
        .attr('x2', xScale('0'))
        .attr('y1', (DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio) / 2)
        .attr('y2', (DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio) / 2)
        .attr('stroke-width', ref.current.nodeHeight * STROKE_WIDTH_PERC)
        .attr('stroke-dasharray', '3, 3');
      workflowsTag
        .append('path')
        .attr('d', getArrowD(ref.current.nodeSizeRatio, ARROW_SIZE_PERC))
        .attr(
          'transform',
          `translate(${xScale('0')}, ${(DEFAULT_NODE_HEIGHT *
            ref.current.nodeSizeRatio) /
            2})`
        )
        .attr('stroke-width', ref.current.nodeHeight * STROKE_WIDTH_PERC);
    },
    edges: function() {
      const edgesContainers = ref.current.edges.enter
        .append('g')
        .attr('class', (d: Edge) => styles[NodeStatus.STOPPED])
        .classed(styles.edge, true);
      edgesContainers
        .append('path')
        .classed(styles.edgeLine, true)
        .attr('d', getArrowD(ref.current.nodeSizeRatio, ARROW_SIZE_PERC))
        .attr(
          'transform',
          (d: Edge) =>
            `translate(${xScale(
              nodeIdToIndex[d.toNode]
            )}, ${(DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio) / 2})`
        )
        .attr('stroke-width', ref.current.nodeHeight * STROKE_WIDTH_PERC);
      edgesContainers
        .append('line')
        .classed('edgeLine', true)
        .classed(styles.edgeLine, true)
        .attr(
          'x1',
          (d: Edge) =>
            xScale(nodeIdToIndex[d.fromNode]) + ref.current.nodeWidth - 2
        )
        .attr('x2', (d: Edge) => xScale(nodeIdToIndex[d.toNode]))
        .attr('y1', (DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio) / 2)
        .attr('y2', (DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio) / 2)
        .attr('stroke-dasharray', '3, 3')
        .attr('stroke-width', ref.current.nodeHeight * STROKE_WIDTH_PERC);
      edgesContainers
        .append('line')
        .classed(styles.lineContainer, true)
        .attr(
          'x1',
          (d: Edge) =>
            xScale(nodeIdToIndex[d.fromNode]) + ref.current.nodeWidth - 2
        )
        .attr('x2', (d: Edge) => xScale(nodeIdToIndex[d.toNode]))
        .attr('y1', (DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio) / 2)
        .attr('y2', (DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio) / 2)
        .on('mouseenter', function() {
          events.edgeHighlight(this, true);
        })
        .on('mouseleave', function() {
          events.edgeHighlight(this, false);
        });
    }
  };

  const update: { [key: string]: Function } = {
    // Pass new data to children components
    workflows: function() {
      ref.current.workflows.group = ref.current.workflows.group.select(
        `.${styles.nodesG}`
      );

      ref.current.nodes.group = ref.current.workflows.group
        .selectAll(`.${styles.node}`)
        .data((d: Workflow) => {
          return d.nodes;
        });

      ref.current.workflows.group
        .selectAll(`.${styles.workflowTag}`)
        .classed(styles.published, published);
    },
    // Updates node status
    nodes: function() {
      ref.current.nodes.group.each(function(d: Node) {
        select(this)
          .select('g')
          .html(
            ReactDOMServer.renderToString(
              <VersionNode
                type={d.type || TYPES.DEFAULT}
                width={ref.current.nodeWidth}
                height={DEFAULT_NODE_HEIGHT * ref.current.nodeSizeRatio}
                status={d.status}
              />
            )
          );
      });
    },
    edges: function() {}
  };

  const events = {
    nodeHighlight: function(d: Node, enter: boolean = true) {
      const node = select(`#node_${d.id}`);
      const strokeWidth = enter ? 2 : 1,
        filter = enter ? 'url(#glow)' : 'none',
        addHoveredClass = enter;

      node.select('.int').attr('stroke-width', strokeWidth);
      node.select('.ext').attr('stroke-width', strokeWidth);
      node.select('.ext').style('filter', filter);
      node.select('.nodeText').classed(styles.hovered, addHoveredClass);
    },
    edgeHighlight: function(node: any, enter: boolean = true) {
      const strokeDashArray = enter ? '10, 0.01' : '3, 3',
        strokeWidth = enter
          ? ref.current.nodeHeight * STROKE_WIDTH_PERC * 1.2
          : ref.current.nodeHeight * STROKE_WIDTH_PERC;

      const lines = select(node.parentNode).selectAll(
        `line.${styles.edgeLine}`
      );
      lines.attr('stroke-dasharray', strokeDashArray);
      lines.attr('stroke-width', strokeWidth);
    }
  };

  return chart;
}

export default VersionStatusViewer;
