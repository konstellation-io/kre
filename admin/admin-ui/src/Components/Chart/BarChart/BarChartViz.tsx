import { ScaleBand, ScaleLinear, scaleBand, scaleLinear } from 'd3-scale';
import { Selection, select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import {
  getAxisHeight,
  getAxisWidth,
  getClassFromLabel,
  rotateAxis,
  tooltipAction
} from 'Utils/d3';

import { Margin } from 'Hooks/useChart';
import React from 'react';
import moment from 'moment';
import styles from './BarChart.module.scss';

const X_SCALE_PADDING_INNER: number = 0.3;
const X_SCALE_PADDING_OUTER: number = 0.4;
const X_AXIS_STEP_THRESHOLD: number = 25;

function getTooltipContent(d: D) {
  const body = d.empty ? (
    <div>No data</div>
  ) : (
    <>
      <div>{`Hits: ${d.y}%`}</div>
      <div>{`Fails: ${100 - d.y}%`}</div>
    </>
  );
  return (
    <div>
      <div className="title">{d.x}</div>
      {body}
    </div>
  );
}

function formatTimeLabel(date: string) {
  const dateHasTime = date.includes('UTC');
  return dateHasTime ? `${moment(date).format('MM-DD-YY - HH')}h` : date;
}

function formatXAxis(x: string, idx: number, skipStep: number) {
  // show 1 label every skip step to reduce total number of labels
  return !(idx % skipStep) ? formatTimeLabel(x) : '';
}

export type D = {
  x: string;
  y: number;
  empty: boolean;
};

type Props = {
  width: number;
  height: number;
  margin: Margin;
  data: D[];
  viewAllData: boolean;
};

class BarChartViz {
  props: Props;
  svg: Selection<SVGElement, unknown, null, undefined>;
  svgRef: SVGElement;
  tooltip: HTMLDivElement;
  g: Selection<SVGGElement, unknown, null, undefined>;
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  xDomain: string[];
  yDomain: [number, number];
  innerWidth: number;
  innerHeight: number;
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
    this.yDomain = [0, 100];
    this.xScale = scaleBand();
    this.yScale = scaleLinear();
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

    // BUILD MAIN G ELEMENT
    this.g = this.svg
      .append('g')
      .classed(styles.g, true)
      .attr('transform', `translate(${this.left},${this.top})`);

    this.createScales();
    this.createAxes();
    this.createLegend();
    this.createBars();
  };

  createScales = () => {
    const { innerWidth, innerHeight, xDomain, yDomain } = this;

    this.xScale = scaleBand()
      .range([0, innerWidth])
      .domain(xDomain)
      .paddingInner(X_SCALE_PADDING_INNER)
      .paddingOuter(X_SCALE_PADDING_OUTER);

    this.yScale = scaleLinear()
      .range([innerHeight, 0])
      .domain(yDomain);
  };

  createAxes = () => {
    const { xScale, yScale, xDomain, g, innerHeight, innerWidth } = this;

    const step = Math.floor(xDomain.length / X_AXIS_STEP_THRESHOLD) + 1;
    const xAxis = axisBottom(xScale)
      .tickSize(0)
      .tickPadding(16)
      .tickFormat((x: string, idx) => formatXAxis(x, idx, step));
    const yAxis = axisLeft(yScale)
      .ticks(4)
      .tickFormat(v => `${v}%`)
      .tickSize(-innerWidth);

    const axes = g.append('g').classed(styles.axes, true);
    const xAxisG = axes
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .classed(styles.xAxis, true)
      .call(xAxis);
    const yAxisG = axes
      .append('g')
      .classed(styles.yAxis, true)
      .call(yAxis);

    rotateAxis(xAxisG, -45);

    // Remove unwanted axes lines
    yAxisG.select('.domain').remove();
    xAxisG.select('.domain').remove();
  };

  createLegend = () => {
    const {
      g,
      props: { width }
    } = this;

    const legend = g.append('g').classed(styles.legend, true);

    const lg = legend
      .selectAll('g')
      .data(['hits', 'fails'])
      .enter()
      .append('g')
      .attr('transform', (d: string, i: number) => `translate(${i * 100},0)`);

    lg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10);

    lg.append('text')
      .attr('x', 17.5)
      .attr('y', 5.5)
      .text((d: string) => d.toUpperCase());

    let offset = 0;
    var nodeWidth = (d: SVGGraphicsElement) => d.getBBox().width;
    lg.attr('transform', function(d: string, i: number) {
      let x = offset;
      offset += nodeWidth(this) + 10;
      return `translate(${x},-30)`;
    });

    legend.attr('transform', function() {
      return `translate(${(width - nodeWidth(this)) / 2},${0})`;
    });
  };

  createBars = () => {
    const {
      xScale,
      yScale,
      g,
      events,
      innerHeight,
      props: { data, viewAllData }
    } = this;

    // Initialize bars
    const barWidth = xScale.bandwidth();
    const barPadding = xScale.step() - xScale.bandwidth();

    const bgBarsG = g.append('g').classed(styles.bars, true);
    const barsG = g.append('g').classed(styles.bars, true);

    const barsContainer = bgBarsG
      .selectAll(`.${styles.bgBar}`)
      .data(data)
      .enter();

    // This bars handles pointer events. Are invisible.
    barsContainer
      .append('rect')
      .attr('class', (d: D) => getClassFromLabel(d.x))
      .classed(styles.eventsBar, true)
      .attr('x', (d: D) => (xScale(d.x) || 0) - barPadding / 2)
      .attr('y', (d: D) => yScale(100))
      .attr('height', (d: D) => Math.max(0, innerHeight - yScale(100)))
      .attr('width', xScale.step())
      .attr('fill', 'transparent')
      .on('mouseenter', function(d: D) {
        events.barHighlight(d, this, true);
      })
      .on('mouseleave', function(d: D) {
        events.barHighlight(d, this, false);
      });

    barsContainer
      .append('rect')
      .attr('class', (d: D) => getClassFromLabel(d.x))
      .classed(styles.bgBar, true)
      .attr('x', (d: D) => xScale(d.x) || 0)
      .attr('y', (d: D) => yScale(100))
      .attr('height', (d: D) =>
        d.empty ? 0 : Math.max(0, innerHeight - yScale(100))
      )
      .attr('width', barWidth);

    const bars = barsG
      .selectAll(`g`)
      .data(data)
      .enter()
      .append('g');

    bars
      .append('rect')
      .attr('class', (d: D) => getClassFromLabel(d.x))
      .classed(styles.bar, true)
      .attr('x', (d: D) => xScale(d.x) || 0)
      .attr('y', (d: D) => yScale(d.y))
      .attr('height', (d: D) => Math.max(0, innerHeight - yScale(d.y)))
      .attr('width', barWidth);

    if (viewAllData && barWidth > 16) {
      bars
        .filter((d: D) => ![0, 100].includes(d.y))
        .append('text')
        .attr('class', (d: D) => (d.y > 80 ? styles.light : styles.dark))
        .classed(styles.barLabel, true)
        .attr('x', (d: D) => (xScale(d.x) || 0) + barWidth / 2)
        .attr('y', (d: D) => yScale(d.y) + (d.y > 80 ? 8 : -12))
        .text((d: D) => d.y);
    }
  };

  events = {
    barHighlight: (d: D, node: SVGRectElement, enter: boolean) => {
      const { xScale, yScale, left, top, svgRef, tooltip } = this;

      if (enter) {
        const barWidth: number = xScale.bandwidth();
        const content = getTooltipContent(d);
        const dx = left + (xScale(d.x) || 0) + barWidth / 2;
        const dy = top + (yScale(d.y) || 0);
        tooltipAction.showTooltip({
          svg: svgRef,
          tooltip,
          content,
          dx,
          dy
        });
      } else {
        tooltipAction.hideTooltip(tooltip);
      }
    }
  };

  getPaddings = () => {
    const { svg, xDomain, yDomain } = this;

    let xAxisHeight = getAxisHeight(svg, xDomain, -45);
    let yAxisWidth = getAxisWidth(
      svg,
      yDomain.map(n => n.toString())
    );

    return {
      top: 0,
      right: 0,
      bottom: xAxisHeight,
      left: yAxisWidth
    };
  };
}

export default BarChartViz;
