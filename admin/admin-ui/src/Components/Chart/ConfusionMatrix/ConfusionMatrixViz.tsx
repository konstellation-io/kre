import {
  Margin,
  generateVerticalGradient,
  getAxisHeight,
  getAxisWidth,
  rotateAxis,
  tooltipAction
} from 'Utils/d3';
import { RGBColor, color } from 'd3-color';
import { ScaleBand, ScaleLinear, scaleBand, scaleLinear } from 'd3-scale';
import { Selection, select } from 'd3-selection';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';

import React from 'react';
import { interpolateHcl } from 'd3-interpolate';
import { range } from 'd3-array';
import styles from './ConfusionMatrix.module.scss';

const SCALE_PADDING_INNER: number = 0.01;
const SCALE_PADDING_OUTER: number = 0;
const AXIS_BOX_HEIGHT_PERC: number = 0.06;
const AXIS_PADDING: number = 12;
const LEGEND_MARGIN_PERC: number = 0.1;
const COLORS = {
  10: '#00252E',
  20: '#00303B',
  30: '#004151',
  40: '#005266',
  60: '#47FFFF',
  80: '#84FFFF',
  90: '#ADFFFF',
  100: '#D6FFFF'
};
const TEXT_COLOR_THRESHOLD = 90;
const TEXT_COLOR = {
  DARK: '#00252E',
  LIGHT: '#CCF5FF'
};
const X_AXIS_MAX_LABEL_LENGTH = 20;

function getTooltipContent(d: D) {
  return (
    <div className={styles.tooltipContent}>
      <div>{`${d.value}%`}</div>
      <div>{`${d.y} \\ ${d.x}`}</div>
    </div>
  );
}

export type D = {
  x: string;
  y: string;
  value: number;
};

type Props = {
  width: number;
  height: number;
  margin: Margin;
  data: D[];
  ellipseLabels: boolean;
};

class ConfusionMatrixViz {
  props: Props;
  svg: Selection<SVGElement, unknown, null, undefined>;
  svgRef: SVGElement;
  tooltip: HTMLDivElement;
  g: Selection<SVGGElement, unknown, null, undefined>;
  xScale: ScaleBand<string>;
  yScale: ScaleBand<string>;
  colorScale: ScaleLinear<string, string>;
  colorDomain: number[];
  xDomain: string[];
  yDomain: string[];
  innerWidth: number;
  innerHeight: number;
  axisBoxSide: number;
  left: number;
  top: number;

  constructor(svg: SVGElement, tooltip: HTMLDivElement, props: Props) {
    this.svg = select(svg);
    this.svgRef = svg;
    this.tooltip = tooltip;
    this.g = this.svg.append('g');
    this.props = props;

    this.innerWidth = props.width;
    this.innerHeight = props.height;
    this.xDomain = props.data.map((d: D) => d.x);
    this.yDomain = props.data.map((d: D) => d.y);
    this.colorDomain = Object.keys(COLORS).map(n => parseInt(n));
    this.xScale = scaleBand();
    this.yScale = scaleBand();
    this.colorScale = scaleLinear<string, string>();
    this.axisBoxSide = props.height * AXIS_BOX_HEIGHT_PERC;
    this.left = 0;
    this.top = 0;

    this.cleanup();
    this.initialize();
  }

  cleanup = () => {
    this.svg.selectAll('*').remove();
  };

  initialize = () => {
    const {
      props: { margin }
    } = this;

    // GET DIMENSIONS
    const padding = this.getPaddings();

    this.left = margin.left + padding.left;
    this.top = margin.top + padding.top;

    this.innerWidth -= this.left + padding.right + margin.right;
    this.innerHeight -= this.top + padding.bottom + margin.bottom;

    // Make chart squared
    const sideMargin = (this.innerWidth - this.innerHeight) / 2;
    this.left += sideMargin;
    this.innerWidth -= sideMargin * 2;

    // BUILD MAIN G ELEMENT
    this.g = this.svg
      .append('g')
      .attr('transform', `translate(${this.left},${margin.top})`);

    this.createScales();
    this.createAxes();
    this.createAxisBoxes();
    this.createLegend();
    this.createCells();
  };

  createScales = () => {
    const { innerWidth, innerHeight, xDomain, yDomain, colorDomain } = this;

    this.xScale = scaleBand()
      .range([0, innerWidth])
      .domain(xDomain)
      .paddingInner(SCALE_PADDING_INNER)
      .paddingOuter(SCALE_PADDING_OUTER);

    this.yScale = scaleBand()
      .range([innerHeight, 0])
      .domain([...yDomain].reverse())
      .paddingInner(SCALE_PADDING_INNER)
      .paddingOuter(SCALE_PADDING_OUTER);

    this.colorScale = scaleLinear<string, string>()
      .domain(colorDomain)
      .interpolate(interpolateHcl)
      .range(Object.values(COLORS));
  };

  createAxes = () => {
    const { xScale, yScale, g, innerHeight, axisBoxSide, ellipseLabel } = this;

    const xAxis = axisBottom(xScale)
      .tickSize(0)
      .tickFormat(ellipseLabel);
    const yAxis = axisLeft(yScale)
      .ticks(0)
      .tickSize(0);

    const axes = g.append('g').classed(styles.axes, true);
    const xAxisG = axes
      .append('g')
      .classed(styles.xAxis, true)
      .attr(
        'transform',
        `translate(0,${innerHeight + 4 + axisBoxSide + AXIS_PADDING})`
      )
      .call(xAxis);
    const yAxisG = axes
      .append('g')
      .classed(styles.yAxis, true)
      .attr('transform', `translate(${-axisBoxSide - AXIS_PADDING},0)`)
      .call(yAxis);

    rotateAxis(xAxisG, -45);

    // Remove unwanted axes lines
    yAxisG.select('.domain').remove();
    xAxisG.select('.domain').remove();

    // Better aligns the X axis labels and adds a title
    xAxisG
      .selectAll('text')
      .attr('dx', 0)
      .attr('dy', 0)
      .append('svg:title')
      .text(d => `${d}`);
  };

  createAxisBoxes = () => {
    const { g, innerWidth, innerHeight, axisBoxSide } = this;

    const axisBoxesG = g.append('g').classed(styles.axisBoxes, true);
    const xAxisBox = axisBoxesG.append('g').classed(styles.x, true);
    const yAxisBox = axisBoxesG.append('g').classed(styles.y, true);

    xAxisBox
      .append('rect')
      .attr('width', Math.max(0, innerWidth))
      .attr('height', axisBoxSide)
      .attr('x', 0)
      .attr('y', innerHeight);
    xAxisBox
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight)
      .attr('dy', axisBoxSide / 2)
      .text('PREDICTED LABEL');

    yAxisBox
      .append('rect')
      .attr('width', axisBoxSide)
      .attr('height', Math.max(0, innerHeight))
      .attr('x', -axisBoxSide)
      .attr('y', 0);
    yAxisBox
      .append('text')
      .style(
        'transform',
        `translate(${-axisBoxSide / 2}px, ${innerHeight / 2}px)rotate(-90deg)`
      )
      .text('TRUE LABEL');
  };

  createLegend = () => {
    const {
      g,
      xScale,
      innerHeight,
      innerWidth,
      props: { width }
    } = this;

    const legendG = g.append('g').classed(styles.legendG, true);

    const legendPadding = width * LEGEND_MARGIN_PERC;
    const legendWidth = Math.min(xScale.bandwidth() / 2, legendPadding * 0.4);
    generateVerticalGradient(g, COLORS);

    legendG
      .append('rect')
      .classed(styles.legendRect, true)
      .attr('width', legendWidth)
      .attr('height', Math.max(0, innerHeight))
      .style('fill', 'url(#verticalGradient)')
      .attr('transform', `translate(${innerWidth + 40},0)`);

    const legendScale = scaleBand()
      .range([innerHeight, 0])
      .domain(range(10, 100, 10).map(n => n.toString()));
    const zAxis = axisRight(legendScale)
      .tickFormat((n: string) => `${n}%`)
      .tickSize(-legendWidth);

    const zAxisG = legendG
      .append('g')
      .attr('transform', `translate(${innerWidth + legendWidth + 40},0)`)
      .classed(styles.zAxis, true)
      .call(zAxis);
    zAxisG.select('.domain').remove();
  };

  getCellDims = () => ({
    width: this.xScale.bandwidth(),
    height: this.yScale.bandwidth()
  });

  createCells = () => {
    const {
      xScale,
      yScale,
      g,
      colorScale,
      events,
      props: { data }
    } = this;

    const cellDims = this.getCellDims();
    const cellsG = g.append('g').classed(styles.cells, true);

    const cells = cellsG
      .selectAll(`.${styles.cell}`)
      .data(data)
      .enter()
      .append('g')
      .classed(styles.cell, true);

    cells
      .append('rect')
      .attr('x', (d: D) => xScale(d.x) || 0)
      .attr('y', (d: D) => yScale(d.y) || 0)
      .attr('height', cellDims.height)
      .attr('width', cellDims.width)
      .attr('fill', (d: D) => colorScale(d.value))
      .on('mouseenter', function(d: D) {
        events.cellHighlight(d, this, true);
      })
      .on('mouseleave', function(d: D) {
        events.cellHighlight(d, this, false);
      });
    cells
      .append('text')
      .attr('x', (d: D) => xScale(d.x) || 0)
      .attr('y', (d: D) => yScale(d.y) || 0)
      .attr('dy', cellDims.height / 2)
      .classed(styles.cellText, true)
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${cellDims.width / 2},0)`)
      .attr('fill', (d: D) => {
        const c: RGBColor = color(colorScale(d.value).toString()) as RGBColor;
        return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > TEXT_COLOR_THRESHOLD
          ? TEXT_COLOR.DARK
          : TEXT_COLOR.LIGHT;
      })
      .text((d: D) => `${d.value}%`);
  };

  events = {
    cellHighlight: (d: D, node: SVGRectElement, enter: boolean) => {
      const cellColor = color(this.colorScale(d.value).toString());
      const newCellColor = enter
        ? cellColor && cellColor.darker(0.6)
        : cellColor;
      select(node).attr('fill', newCellColor?.toString() || '');

      if (enter) {
        const cellDims = this.getCellDims();
        const content = getTooltipContent(d);
        const dx = this.left + (this.xScale(d.x) || 0) + cellDims.width / 2;
        const dy = this.top + (this.yScale(d.y) || 0) + cellDims.height / 2;
        tooltipAction.showTooltip({
          svg: this.svgRef,
          tooltip: this.tooltip,
          content,
          dx,
          dy
        });
      } else {
        tooltipAction.hideTooltip(this.tooltip);
      }
    }
  };

  ellipseLabel = (label: string) => {
    if (!this.props.ellipseLabels) return label;

    return label.length > X_AXIS_MAX_LABEL_LENGTH
      ? `${label.slice(0, X_AXIS_MAX_LABEL_LENGTH)}...`
      : label;
  };

  getPaddings = () => {
    const {
      svg,
      xDomain,
      yDomain,
      axisBoxSide,
      ellipseLabel,
      props: { width }
    } = this;

    let xAxisHeight = getAxisHeight(svg, xDomain.map(ellipseLabel), -45);
    let yAxisWidth = getAxisWidth(svg, yDomain);

    const leftAxisPadding = axisBoxSide + yAxisWidth + AXIS_PADDING;
    const bottomAxisPadding = axisBoxSide + xAxisHeight + AXIS_PADDING;
    const legendPadding = width * LEGEND_MARGIN_PERC;

    return {
      top: 0,
      right: legendPadding,
      bottom: bottomAxisPadding,
      left: leftAxisPadding
    };
  };
}

export default ConfusionMatrixViz;
