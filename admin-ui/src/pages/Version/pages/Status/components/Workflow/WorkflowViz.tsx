import React from 'react';
import ReactDOMServer from 'react-dom/server';
import InputNodeIcon from '@material-ui/icons/ArrowRightAlt';
import OutputNodeIcon from '@material-ui/icons/KeyboardTab';
import { GetVersionWorkflows_version_workflows } from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import { select } from 'd3-selection';
import { ScaleBand, scaleBand } from 'd3-scale';
import { range } from 'd3-array';
import styles from './Workflow.module.scss';
import { rgb, color } from 'd3-color';
import {
  VersionStatus,
  NodeStatus
} from '../../../../../../graphql/types/globalTypes';

const SCALE_PADDING_INNER = 0.6;
const SCALE_PADDING_OUTER = 0.1;
const NODE_INNER_CIRCLE_PERC = 0.5;
const OFFSET_TOP_PERC = 0.7;
const NODE_LABEL_PADDING = {
  VERTICAL: 4,
  HORIZONTAL: 25
};
const ICON_SIZE = 25;

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
};

class WorkflowViz {
  props: Props;
  svg: any;
  xScale: ScaleBand<string>;
  nodeOuterRadius: number;
  nodeInnerRadius: number;
  nodeCentroidDistance: number;
  yOffset: number;
  edgeWidth: number;
  nodesG: any;
  edgesG: any;
  defs: any;
  prevNodeLabelRightX: number;

  constructor(svg: SVGElement, props: Props) {
    this.svg = select(svg);
    this.props = props;

    this.xScale = scaleBand();
    this.nodeOuterRadius = 0;
    this.nodeInnerRadius = 0;
    this.nodeCentroidDistance = 0;
    this.edgeWidth = 0;
    this.prevNodeLabelRightX = 0;
    this.yOffset = props.height * OFFSET_TOP_PERC;

    this.cleanup();
    this.initialize();
  }

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

    const xDomain = data.nodes.map((n: any) => n.id);
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

  update = () => {
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
      props: { data }
    } = this;
    const self = this;

    const circle = nodesG
      .selectAll(`g.${styles.node}`)
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${xScale(d.id)}, ${yOffset})`)
      .attr('class', (d: any) => styles[d.status])
      .classed(styles.node, true)
      .each(function(d: any) {
        generateLink((xScale(d.id) || 0) + nodeOuterRadius * 2, d.status);
        generateNodeLabel(this, d.name, self);
      });

    circle
      .append('circle')
      .classed(styles.outerCircle, true)
      .attr('r', nodeOuterRadius)
      .attr('cx', nodeOuterRadius);

    circle
      .append('circle')
      .classed(styles.innerCircle, true)
      .attr('r', nodeInnerRadius)
      .attr('cx', nodeOuterRadius);
  };

  generateNodeLabel = (node: any, label: string, self: any) => {
    const {
      nodeOuterRadius,
      yOffset,
      prevNodeLabelRightX,
      nodeCentroidDistance
    } = self;

    let labelYOffset = yOffset;

    const box = select(node)
      .append('g')
      .attr(
        'transform',
        `translate(${nodeOuterRadius}, ${-labelYOffset + 16})`
      );

    const labelEl = box
      .append('text')
      .classed(styles.nodeLabel, true)
      .attr('dy', 1)
      .text(label);

    // @ts-ignore
    const bbox = labelEl.node().getBBox();
    const rectDims = {
      width: bbox.width + 2 * NODE_LABEL_PADDING.HORIZONTAL,
      height: bbox.height + 2 * NODE_LABEL_PADDING.VERTICAL
    };

    const actX = rectDims.width / 2;
    const prevRightX = nodeCentroidDistance - prevNodeLabelRightX;
    const shouldMoveLabel = actX >= prevRightX;

    if (shouldMoveLabel) {
      labelYOffset = yOffset - 35;

      box.attr(
        'transform',
        `translate(${nodeOuterRadius}, ${-labelYOffset + 16})`
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
      .attr('y2', labelYOffset);

    self.prevNodeLabelRightX = shouldMoveLabel ? 0 : actX;
  };

  generateInputNode = () => {
    const {
      nodesG,
      nodeOuterRadius,
      xScale,
      yOffset,
      props: { data, workflowStatus }
    } = this;

    const side = nodeOuterRadius * 2;
    const x = xScale('Input') || 0;
    const lineOffset = side * 0.1;
    const y = yOffset - side / 2;

    const inputNode = nodesG
      .append('g')
      .classed(styles.inputNode, true)
      .classed(styles[workflowStatus], true);
    inputNode
      .append('rect')
      .attr('rx', 6)
      .attr('x', x)
      .attr('y', y)
      .attr('height', side)
      .attr('width', side - lineOffset);
    inputNode
      .append('path')
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
    inputNode.append('path').attr('d', () => {
      return `
        M ${x + side - lineOffset - 1} ${y + 2.5}
        L ${x + side} ${y + side / 2}
        L ${x + side - lineOffset - 1} ${y + side - 2.5}
      `;
    });

    const linkStatus = data.nodes[0].status;

    this.addIcon(inputNode, InputNodeIcon, xScale('Input') || 0);
    this.generateLink(x + side, linkStatus);
  };

  generateOutputNode = () => {
    const {
      nodesG,
      nodeOuterRadius,
      xScale,
      yOffset,
      props: { workflowStatus }
    } = this;

    const side = nodeOuterRadius * 2;
    const x = xScale('Output') || 0;
    const lineOffset = side * 0.1;
    const y = yOffset - side / 2;

    const outputNode = nodesG
      .append('g')
      .classed(styles.outputNode, true)
      .classed(styles[workflowStatus], true);
    outputNode
      .append('rect')
      .attr('rx', 6)
      .attr('x', x)
      .attr('y', y)
      .attr('height', side)
      .attr('width', side);
    outputNode
      .append('path')
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
    outputNode.append('path').attr('d', () => {
      return `
        M ${x - 0.8} ${y + 6}
        L ${x + lineOffset} ${y + side / 2}
        L ${x - 0.8} ${y + side - 6}
      `;
    });

    this.addIcon(outputNode, OutputNodeIcon, xScale('Output') || 0);
  };

  addIcon = (parent: any, Icon: any, dx: number) => {
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

  generateLink = (x1: number, status: VersionStatus | NodeStatus) => {
    const { edgesG, edgeWidth, yOffset } = this;

    const lineG = edgesG
      .append('g')
      .classed(styles.lineG, true)
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
  };

  generateFilters = () => {
    const { defs } = this;

    const color = rgb('rgb(0, 187, 230)');
    const matrix = '0 0 0 red 0 0 0 0 0 green 0 0 0 0 blue 0 0 0 0.5 0';
    const colorMatrix = matrix
      .replace('red', color.r.toString())
      .replace('green', color.g.toString())
      .replace('blue', color.b.toString());

    const glow = defs
      .append('filter')
      .attr('id', 'glow')
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
      .attr('stdDeviation', 8)
      .attr('result', 'coloredBlur');

    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  };
}

export default WorkflowViz;
