import { GetVersionWorkflows_version_workflows } from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import { select } from 'd3-selection';
import { ScaleBand, scaleBand } from 'd3-scale';
import { range } from 'd3-array';
import styles from './Workflow.module.scss';
import { rgb, color } from 'd3-color';

const SCALE_PADDING_INNER = 0.6;
const SCALE_PADDING_OUTER = 0.1;
const NODE_INNER_CIRCLE_PERC = 0.5;

type Props = {
  data: GetVersionWorkflows_version_workflows;
  width: number;
  height: number;
};

class WorkflowViz {
  props: Props;
  svg: any;
  xScale: ScaleBand<string>;
  nodeOuterRadius: number;
  nodeInnerRadius: number;
  edgeWidth: number;
  nodesG: any;
  edgesG: any;
  defs: any;

  constructor(svg: SVGElement, props: Props) {
    this.svg = select(svg);
    this.props = props;

    this.xScale = scaleBand();
    this.nodeOuterRadius = 0;
    this.nodeInnerRadius = 0;
    this.edgeWidth = 0;

    this.cleanup();
    this.initialize();
  }

  cleanup = () => {
    this.svg.selectAll('*').remove();
  };

  initialize = () => {
    const {
      props: { data, width }
    } = this;

    this.nodesG = this.svg.append('g').classed(styles.nodesG, true);
    this.edgesG = this.svg.append('g').classed(styles.edgesG, true);
    this.defs = this.svg.append('defs');

    const xDomain = data.nodes.map((n: any) => n.id);
    xDomain.unshift('Input');
    xDomain.push('Output');

    this.xScale
      .range([0, width])
      .paddingInner(SCALE_PADDING_INNER)
      .paddingOuter(SCALE_PADDING_OUTER)
      .domain(xDomain);

    this.nodeOuterRadius = this.xScale.bandwidth() / 2;
    this.nodeInnerRadius = this.nodeOuterRadius * NODE_INNER_CIRCLE_PERC;
    this.edgeWidth = this.xScale.step() - this.xScale.bandwidth();

    this.generateFilters();
  };

  resize = () => {};

  update = () => {
    const {
      nodesG,
      nodeInnerRadius,
      nodeOuterRadius,
      xScale,
      props: { data, height }
    } = this;

    const circle = nodesG
      .selectAll(`g.${styles.node}`)
      .data(data.nodes)
      .enter()
      .append('g')
      .classed(styles.node, true)
      .each((d: any) =>
        this.generateLink((xScale(d.id) || 0) + nodeOuterRadius * 2)
      );

    circle
      .append('circle')
      .classed(styles.outerCircle, true)
      .attr('r', nodeOuterRadius)
      .attr('cx', (d: any) => nodeOuterRadius + (xScale(d.id) || 0))
      .attr('cy', height / 2);

    circle
      .append('circle')
      .classed(styles.innerCircle, true)
      .attr('r', nodeInnerRadius)
      .attr('cx', (d: any) => nodeOuterRadius + (xScale(d.id) || 0))
      .attr('cy', height / 2);

    this.generateInputNode();
    this.generateOutputNode();
  };

  generateInputNode = () => {
    const {
      nodesG,
      nodeOuterRadius,
      xScale,
      props: { height }
    } = this;

    const side = nodeOuterRadius * 2;
    const x = xScale('Input') || 0;
    const lineOffset = side * 0.1;
    const y = (height - side) / 2;

    const inputNode = nodesG.append('g').classed(styles.inputNode, true);
    inputNode
      .append('rect')
      .attr('rx', 6)
      .attr('x', x)
      .attr('y', y)
      .attr('height', side)
      .attr('width', side - lineOffset);
    inputNode.append('path').attr('d', () => {
      return `
        M ${x + side - lineOffset - 1} ${y + 2.5}
        L ${x + side} ${y + side / 2}
        L ${x + side - lineOffset - 1} ${y + side - 2.5}
      `;
    });

    this.generateLink(x + side);
  };

  generateOutputNode = () => {
    const {
      nodesG,
      nodeOuterRadius,
      edgeWidth,
      xScale,
      props: { data, height }
    } = this;

    const side = nodeOuterRadius * 2;
    const x = xScale('Output') || 0;
    const lineOffset = side * 0.1;
    const y = (height - side) / 2;

    const outputNode = nodesG.append('g').classed(styles.outputNode, true);
    outputNode
      .append('rect')
      .attr('rx', 6)
      .attr('x', x)
      .attr('y', y)
      .attr('height', side)
      .attr('width', side);
    outputNode.append('path').attr('d', () => {
      return `
        M ${x - 0.8} ${y + 6}
        L ${x + lineOffset} ${y + side / 2}
        L ${x - 0.8} ${y + side - 6}
      `;
    });
  };

  generateLink = (x1: number) => {
    const {
      edgesG,
      edgeWidth,
      nodeOuterRadius,
      props: { height }
    } = this;

    const lineG = edgesG.append('g').classed(styles.lineG, true);
    const side = nodeOuterRadius * 2;
    const y = (height - side) / 2 + side / 2;

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

    const c = rgb('rgba(0, 207, 255, 1)');
    const matrix = '0 0 0 red 0 0 0 0 0 green 0 0 0 0 blue 0 0 0 1 0';
    const colorMatrix = matrix
      .replace('red', c.r.toString())
      .replace('green', c.g.toString())
      .replace('blue', c.b.toString());

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
      // .attr('in', 'SourceGraphics')
      .attr('stdDeviation', 8)
      .attr('result', 'coloredBlur');

    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  };
}

export default WorkflowViz;
