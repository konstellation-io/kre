import {
  FinalStates,
  getLinkState,
  getProcessState,
  getWorkflowState
} from '../../states';
import {
  GetVersionWorkflows_version_workflows,
  GetVersionWorkflows_version_workflows_nodes
} from 'Graphql/queries/types/GetVersionWorkflows';
import { InputElContent, NodeTypes } from '../Tooltip/TooltipContents';
import React, { FunctionComponent } from 'react';
import { ScaleBand, scaleBand } from 'd3-scale';
import { Selection, select } from 'd3-selection';

import { ReactComponent as InputNode } from '../../icons/inputNode.svg';
import InputNodeIcon from '@material-ui/icons/Public';
import OutputNodeIcon from '@material-ui/icons/KeyboardTab';
import ReactDOMServer from 'react-dom/server';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { TooltipRefs } from '../WorkflowsManager/WorkflowsManager';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { get } from 'lodash';
import { rgb } from 'd3-color';
import styles from './WorkflowViz.module.scss';

type D = GetVersionWorkflows_version_workflows_nodes;

const SCALE_PADDING_INNER = 0.6;
const SCALE_PADDING_OUTER = 0.1;
const NODE_INNER_CIRCLE_PERC = 0.5;
const OFFSET_TOP_PERC = 0.7;
const NODE_LABEL_PADDING = {
  VERTICAL: 7,
  HORIZONTAL: 25
};
const MARGIN_TOP_LABELS = 4;
const ICON_SIZE = 20;

export type Margin = {
  right: number;
  left: number;
};

type Props = {
  data: GetVersionWorkflows_version_workflows;
  width: number;
  height: number;
  margin: Margin;
  workflowStatus: VersionStatus;
  onInnerNodeClick: Function;
  onInputNodeClick: Function;
  tooltipRefs: TooltipRefs;
  enableNodeClicks: boolean;
};

function getTooltipHeader(nodeType: NodeTypes) {
  let title = '';
  let Icon;

  switch (nodeType) {
    case NodeTypes.INPUT:
      title = 'INPUT PROCESS';
      Icon = <InputNode />;
      break;
    default:
      title = 'TITLE';
      Icon = <InputNode />;
  }

  return { title, Icon };
}
function getTooltipContent(nodeType: NodeTypes) {
  let content;

  switch (nodeType) {
    case NodeTypes.INPUT:
      content = <InputElContent nodeType={nodeType} />;
      break;
    default:
      content = <div>CONTENT</div>;
  }

  return content;
}

class WorkflowViz {
  props: Props;
  svg: Selection<SVGElement, unknown, null, undefined>;
  xScale: ScaleBand<string>;
  nodeOuterRadius: number;
  nodeInnerRadius: number;
  nodeCentroidDistance: number;
  yOffset: number;
  edgeWidth: number;
  nodesG: Selection<SVGGElement, unknown, null, undefined>;
  edgesG: Selection<SVGGElement, unknown, null, undefined>;
  defs: Selection<SVGGElement, unknown, null, undefined>;
  inputNode: Selection<SVGGElement, unknown, null, undefined> | null;
  outputNode: Selection<SVGGElement, unknown, null, undefined> | null;

  constructor(svg: SVGElement, props: Props) {
    this.svg = select(svg);
    this.props = props;

    this.xScale = scaleBand();
    this.nodeOuterRadius = 0;
    this.nodeInnerRadius = 0;
    this.nodeCentroidDistance = 0;
    this.edgeWidth = 0;
    this.yOffset = props.height * OFFSET_TOP_PERC;

    // Vars initialization
    this.inputNode = null;
    this.outputNode = null;
    this.nodesG = this.svg.select('init');
    this.edgesG = this.svg.select('init');
    this.defs = this.svg.select('init');

    this.cleanup();
    this.initialize();
  }

  idToSelector = (id: string) => {
    return `selector_${this.props.data.id}_${id.replace(/-/g, '')}`;
  };

  cleanup = () => {
    this.svg.selectAll('*').remove();
  };

  initialize = () => {
    const {
      props: { data, width, margin }
    } = this;

    this.nodesG = this.svg.append('g').classed(styles.nodesG, true);
    this.edgesG = this.svg.append('g').classed(styles.edgesG, true);
    this.defs = this.svg.append('defs');

    const xDomain = data.nodes.map((d: D) => d.id);
    xDomain.unshift('Input');
    xDomain.push('Output');

    const xRange: [number, number] = [margin.left, width - margin.right];
    this.xScale
      .range(xRange)
      .paddingInner(SCALE_PADDING_INNER)
      .paddingOuter(SCALE_PADDING_OUTER)
      .domain(xDomain);

    this.nodeOuterRadius = this.xScale.bandwidth() / 2;
    this.nodeInnerRadius = this.nodeOuterRadius * NODE_INNER_CIRCLE_PERC;
    this.edgeWidth = this.xScale.step() - this.xScale.bandwidth();
    this.nodeCentroidDistance = this.edgeWidth + 2 * this.nodeOuterRadius;

    this.generateFilters();
  };

  resize = () => {};

  update = (
    data: GetVersionWorkflows_version_workflows,
    workflowStatus: VersionStatus,
    tooltipRefs: TooltipRefs
  ) => {
    this.props.data = data;
    this.props.workflowStatus = workflowStatus;
    this.props.tooltipRefs = tooltipRefs;

    this.generateInnerNodes();
    this.generateInputNode();
    this.generateOutputNode();
  };

  generateInnerNodes = () => {
    const {
      nodesG,
      nodeInnerRadius,
      nodeOuterRadius,
      xScale,
      yOffset,
      generateLink,
      generateNodeLabel,
      props: { data, onInnerNodeClick, enableNodeClicks }
    } = this;
    const self = this;

    const circles = nodesG
      .selectAll<SVGGElement, null>(`g.${styles.node}`)
      .data(data.nodes);

    const newCircles = circles
      .enter()
      .append('g')
      .attr('transform', (d: D) => `translate(${xScale(d.id)}, ${yOffset})`)
      .attr('class', (d: D) => styles[getProcessState(d.status)])
      .classed(styles.node, true);

    const newCirclesG = newCircles.append('g').classed(styles.circlesG, true);

    newCirclesG
      .append('circle')
      .classed(styles.animOuterCircle, true)
      .attr('r', nodeOuterRadius)
      .attr('cx', nodeOuterRadius);

    newCirclesG
      .append('circle')
      .classed(styles.outerCircle, true)
      .classed(styles.clicksDisabled, !enableNodeClicks)
      .attr('r', nodeOuterRadius)
      .attr('cx', nodeOuterRadius)
      .on('click', (d: D) => enableNodeClicks && onInnerNodeClick(d.name));

    newCirclesG
      .append('circle')
      .classed(styles.innerCircle, true)
      .attr('r', nodeInnerRadius)
      .attr('cx', nodeOuterRadius);

    newCircles.each(function(d: D, idx: number) {
      generateLink(
        (xScale(d.id) || 0) + nodeOuterRadius * 2,
        getLinkState(d.status),
        d.id
      );
      generateNodeLabel(this, d.name, self, idx);
    });

    // Old circles
    circles
      .attr('class', (d: D) => styles[getProcessState(d.status)])
      .classed(styles.node, true)
      .each(function(d: D) {
        generateLink(
          (xScale(d.id) || 0) + nodeOuterRadius * 2,
          getLinkState(d.status),
          d.id
        );
      });

    circles.merge(newCircles);
  };

  generateNodeLabel = (
    node: SVGGElement,
    label: string,
    self: this,
    idx: number
  ) => {
    const { nodeOuterRadius, nodeInnerRadius, yOffset } = self;

    const textSize = 16;
    const labelSeparation = 36;

    let labelYOffset = yOffset - MARGIN_TOP_LABELS;

    const box = select(node)
      .append('g')
      .classed(styles.labelG, true)
      .attr(
        'transform',
        `translate(${nodeOuterRadius}, ${-labelYOffset + textSize})`
      );

    const labelEl = box
      .append('text')
      .classed(styles.nodeLabel, true)
      .attr('dy', 1)
      .text(label);

    const bbox = labelEl?.node()?.getBBox() || {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    };
    const rectDims = {
      width: bbox.width + 2 * NODE_LABEL_PADDING.HORIZONTAL,
      height: bbox.height + 2 * NODE_LABEL_PADDING.VERTICAL
    };

    const labelIsOdd = idx % 2;
    const shouldMoveLabel = labelIsOdd;

    if (shouldMoveLabel) {
      labelYOffset = yOffset - labelSeparation - MARGIN_TOP_LABELS;

      box.attr(
        'transform',
        `translate(${nodeOuterRadius}, ${-labelYOffset + textSize})`
      );
    }

    box
      .insert('rect', 'text')
      .classed(styles.nodeLabelRect, true)
      .attr('x', bbox.x - NODE_LABEL_PADDING.HORIZONTAL)
      .attr('y', bbox.y - NODE_LABEL_PADDING.VERTICAL)
      .attr('width', rectDims.width)
      .attr('height', rectDims.height);

    box
      .insert('line', 'rect')
      .classed(styles.nodeLabelLine, true)
      .attr('x1', 0)
      .attr('y1', NODE_LABEL_PADDING.VERTICAL)
      .attr('x2', 0)
      .attr('y2', labelYOffset - nodeOuterRadius - nodeInnerRadius);
  };

  generateInputNode = () => {
    const {
      nodesG,
      nodeOuterRadius,
      xScale,
      yOffset,
      getTooltip,
      props: {
        enableNodeClicks,
        data,
        workflowStatus,
        onInputNodeClick,
        tooltipRefs: { onHideTooltip, lastHoveredNode }
      }
    } = this;
    const side = nodeOuterRadius * 2;
    const x = xScale('Input') || 0;
    const lineOffset = side * 0.1;
    const y = yOffset - side / 2;
    const linkStatus = getLinkState(data.nodes[0].status);

    if (this.inputNode === null) {
      this.inputNode = nodesG
        .append('g')
        .classed(styles.inputNode, true)
        .classed(styles[getWorkflowState(workflowStatus)], true)
        .classed(styles.clicksDisabled, !enableNodeClicks)
        .on('mouseenter', function() {
          getTooltip({
            x,
            y,
            side,
            nodeType: NodeTypes.INPUT,
            status: getWorkflowState(workflowStatus, data.nodes),
            node: this
          });
        })
        .on('click', () => enableNodeClicks && onInputNodeClick())
        .on('mouseleave', () => onHideTooltip());
      this.inputNode
        .append('rect')
        .classed(styles.shape, true)
        .attr('rx', 6)
        .attr('x', x)
        .attr('y', y)
        .attr('height', side)
        .attr('width', side - lineOffset);
      this.inputNode
        .append('path')
        .classed(styles.peakCut, true)
        .attr('stroke', 'transparent')
        .attr('d', () => {
          return `
          M ${x + side - lineOffset - 6} ${y + 2.5}
          h 5
          L ${x + side} ${y + side / 2}
          L ${x + side - lineOffset - 1} ${y + side - 2.5}
          h -5
        `;
        });
      this.inputNode
        .append('path')
        .classed(styles.nodePeak, true)
        .attr('d', () => {
          return `
          M ${x + side - lineOffset - 1} ${y + 2.5}
          L ${x + side} ${y + side / 2}
          L ${x + side - lineOffset - 1} ${y + side - 2.5}
        `;
        });

      this.addIcon(this.inputNode, InputNodeIcon, xScale('Input') || 0);
    } else {
      this.inputNode
        .attr('class', styles.inputNode)
        .classed(styles.clicksDisabled, !enableNodeClicks)
        .classed(styles.hovered, function() {
          return this === lastHoveredNode;
        })
        .classed(styles[getWorkflowState(workflowStatus)], true)
        .on('mouseenter', function() {
          getTooltip({
            x,
            y,
            side,
            nodeType: NodeTypes.INPUT,
            status: getWorkflowState(workflowStatus, data.nodes),
            node: this
          });
        });
    }

    this.generateLink(x + side, linkStatus, 'inputNode');
  };

  getTooltip = ({
    x,
    y,
    side,
    nodeType,
    status,
    node
  }: {
    x: number;
    y: number;
    side: number;
    nodeType: NodeTypes;
    status: FinalStates;
    node: any;
  }) => {
    const {
      getTooltipCoords,
      props: {
        tooltipRefs: { onShowTooltip }
      }
    } = this;
    const { left, top } = getTooltipCoords(x, y, side);
    const header = getTooltipHeader(nodeType);
    const content = getTooltipContent(nodeType);
    onShowTooltip({
      status,
      node,
      left,
      top,
      header,
      content
    });
  };

  getTooltipCoords = (x: number, y: number, side: number) => {
    const { svg } = this;

    const svgDims = svg.node()?.getBoundingClientRect();
    const left = get(svgDims, 'left', 0) + x + side / 2;
    const top = get(svgDims, 'top', 0) + y;

    return { left, top };
  };

  generateOutputNode = () => {
    const {
      nodesG,
      nodeOuterRadius,
      xScale,
      yOffset,
      props: { workflowStatus }
    } = this;

    if (this.outputNode === null) {
      const side = nodeOuterRadius * 2;
      const x = xScale('Output') || 0;
      const lineOffset = side * 0.1;
      const y = yOffset - side / 2;

      this.outputNode = nodesG
        .append('g')
        .classed(styles.outputNode, true)
        .classed(styles[getWorkflowState(workflowStatus)], true);
      this.outputNode
        .append('rect')
        .classed(styles.shape, true)
        .attr('rx', 6)
        .attr('x', x)
        .attr('y', y)
        .attr('height', side)
        .attr('width', side);
      this.outputNode
        .append('path')
        .classed(styles.peakCut, true)
        .attr('stroke', 'transparent')
        .attr('d', () => {
          return `
          M ${x - 5.8} ${y + 6}
          h 5
          L ${x + lineOffset} ${y + side / 2}
          L ${x - 0.8} ${y + side - 6}
          h -5
        `;
        });
      this.outputNode
        .append('path')
        .classed(styles.nodePeak, true)
        .attr('d', () => {
          return `
          M ${x - 0.8} ${y + 6}
          L ${x + lineOffset} ${y + side / 2}
          L ${x - 0.8} ${y + side - 6}
        `;
        });

      this.addIcon(this.outputNode, OutputNodeIcon, xScale('Output') || 0);
    } else {
      this.outputNode
        .attr('class', styles.outputNode)
        .classed(styles[getWorkflowState(workflowStatus)], true);
    }
  };

  addIcon = (
    parent: Selection<SVGGElement, unknown, null, undefined>,
    Icon: FunctionComponent<SvgIconProps>,
    dx: number
  ) => {
    const { nodeOuterRadius, yOffset } = this;

    const icon = ReactDOMServer.renderToString(
      <Icon width={ICON_SIZE} height={ICON_SIZE} />
    );
    const iconX = dx + nodeOuterRadius - ICON_SIZE / 2;
    const iconY = yOffset - ICON_SIZE / 2;

    parent
      .append('g')
      .attr('transform', `translate(${iconX},${iconY})`)
      .classed(styles.icon, true)
      .html(icon);
  };

  generateLink = (x1: number, status: FinalStates, nodeId: string) => {
    const { edgesG, edgeWidth, yOffset, idToSelector } = this;

    const link = select(`.${idToSelector(nodeId)}`);

    if (link.size() === 0) {
      const lineG = edgesG
        .append('g')
        .classed(styles.lineG, true)
        .classed(idToSelector(nodeId), true)
        .classed(styles[status], true);
      const y = yOffset;

      lineG
        .append('line')
        .classed(styles.line, true)
        .attr('x1', x1)
        .attr('x2', x1 + edgeWidth)
        .attr('y1', y)
        .attr('y2', y);

      const lineX = 12;
      const lineY = 6;
      lineG
        .append('path')
        .classed(styles.path, true)
        .attr('d', () => {
          return `
            M ${x1 + edgeWidth} ${y}
            l ${-lineX} ${-lineY}
            M ${x1 + edgeWidth} ${y}
            l ${-lineX} ${lineY}
          `;
        })
        .attr('x1', x1)
        .attr('x2', x1 + edgeWidth)
        .attr('y1', y)
        .attr('y2', y);
    } else {
      link
        .attr('class', styles.lineG)
        .classed(idToSelector(nodeId), true)
        .classed(styles[status], true);
    }
  };

  generateFilters = () => {
    const { defs } = this;

    const color = rgb('rgb(0, 187, 230)');
    const matrix = '0 0 0 red 0 0 0 0 0 green 0 0 0 0 blue 0 0 0 0.5 0';
    const colorMatrix = matrix
      .replace('red', color.r.toString())
      .replace('green', color.g.toString())
      .replace('blue', color.b.toString());

    this.generateGlow('glow', 8, defs, colorMatrix);
    this.generateGlow('glowLow', 2, defs, colorMatrix);
  };

  generateGlow = (
    id: string,
    stdDeviation: number,
    defs: Selection<SVGGElement, unknown, null, undefined>,
    colorMatrix: string
  ) => {
    const glow = defs
      .append('filter')
      .attr('id', id)
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    glow
      .append('feColorMatrix')
      .attr('type', 'matrix')
      .attr('values', colorMatrix);
    glow
      .append('feGaussianBlur')
      .attr('stdDeviation', stdDeviation)
      .attr('result', 'coloredBlur');

    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  };
}

export default WorkflowViz;
