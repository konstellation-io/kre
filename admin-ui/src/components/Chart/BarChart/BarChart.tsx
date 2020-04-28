import React from 'react';

import useChart, { Margin } from '../../../hooks/useChart';

import {
  getAxesMargins,
  tooltipAction,
  getClassFromLabel,
  rotateAxis
} from '../../../utils/d3';

import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { axisBottom, axisLeft, Axis } from 'd3-axis';
import { select, Selection } from 'd3-selection';

import styles from './BarChart.module.scss';
import moment from 'moment';

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
function BarChart({ width, height, margin, data, viewAllData }: Props) {
  const { svg, chart, tooltip } = useChart({
    width,
    height,
    margin,
    initialize,
    useTooltip: true
  });

  let g: Selection<SVGGElement, unknown, null, undefined>;
  let xScale: ScaleBand<string>;
  let yScale: ScaleLinear<number, number>;
  let axes: Selection<SVGGElement, unknown, null, undefined>;
  let xAxis: Axis<string>;
  let yAxis: Axis<number | { valueOf(): number }>;
  let xAxisG: Selection<SVGGElement, unknown, null, undefined>;
  let yAxisG: Selection<SVGGElement, unknown, null, undefined>;
  let barsG: Selection<SVGGElement, unknown, null, undefined>;
  let bgBarsG: Selection<SVGGElement, unknown, null, undefined>;
  let marginLeft: number;
  let marginTop: number;

  let innerWidth: number = width - margin.left - margin.right;
  let innerHeight: number = height - margin.top - margin.bottom;

  function initialize() {
    const svgSelection = select(svg.current);
    marginLeft = margin.left;
    marginTop = margin.top;

    g = svgSelection.append('g').classed(styles.g, true);

    const xDomain = data.map((d: D) => d.x);
    const yDomain: [number, number] = [0, 100];

    // Initialize scales
    xScale = scaleBand()
      .range([0, innerWidth])
      .domain(xDomain)
      .paddingInner(X_SCALE_PADDING_INNER)
      .paddingOuter(X_SCALE_PADDING_OUTER);

    yScale = scaleLinear()
      .range([innerHeight, 0])
      .domain(yDomain);

    // Initialize axes
    const step = Math.floor(xDomain.length / X_AXIS_STEP_THRESHOLD) + 1;
    xAxis = axisBottom(xScale)
      .tickSize(0)
      .tickPadding(16)
      .tickFormat((x: string, idx) => formatXAxis(x, idx, step));
    yAxis = axisLeft(yScale)
      .ticks(4)
      .tickFormat(v => `${v}%`);

    axes = g.append('g').classed(styles.axes, true);
    xAxisG = axes
      .append('g')
      .attr('transform', `translate(0,0)`)
      .classed(styles.xAxis, true)
      .call(xAxis);
    yAxisG = axes
      .append('g')
      .classed(styles.yAxis, true)
      .call(yAxis);

    rotateAxis(xAxisG, -45);

    const [xAxisHeight, yAxisWidth] = getAxesMargins({ xAxisG, yAxisG });

    marginLeft += yAxisWidth;
    innerWidth -= yAxisWidth;
    innerHeight -= xAxisHeight;

    g.attr('transform', `translate(${marginLeft},${marginTop})`);

    xScale.range([0, innerWidth]);
    yScale.range([innerHeight, 0]);

    xAxisG.attr('transform', `translate(0,${innerHeight})`);

    xAxis.scale(xScale);
    yAxis.scale(yScale).tickSize(-innerWidth);

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);

    // Remove unwanted axes lines
    yAxisG.select('.domain').remove();
    xAxisG.select('.domain').remove();

    // Add legend
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
      return `translate(${x},${0 - 30})`;
    });

    legend.attr('transform', function() {
      return `translate(${(width - nodeWidth(this)) / 2},${0})`;
    });

    // Initialize bars
    const barWidth: number = xScale.bandwidth();
    const barPadding: number = xScale.step() - xScale.bandwidth();

    bgBarsG = g.append('g').classed(styles.bars, true);
    barsG = g.append('g').classed(styles.bars, true);

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
        .classed(styles.barLabel, true)
        .attr('x', (d: D) => (xScale(d.x) || 0) + barWidth / 2)
        .attr('y', (d: D) => yScale(d.y) + (d.y > 80 ? 8 : -12))
        .text((d: D) => d.y);
    }
  }

  const events = {
    barHighlight: function(d: D, node: SVGRectElement, enter: boolean): void {
      if (enter) {
        const barWidth: number = xScale.bandwidth();
        const content = getTooltipContent(d);
        const dx = marginLeft + (xScale(d.x) || 0) + barWidth / 2;
        const dy = marginTop + (yScale(d.y) || 0);
        tooltipAction.showTooltip({
          svg: svg.current as SVGElement,
          tooltip: tooltip.current as HTMLDivElement,
          content,
          dx,
          dy
        });
      } else {
        tooltipAction.hideTooltip(tooltip.current);
      }
    }
  };

  return chart;
}

export default BarChart;
