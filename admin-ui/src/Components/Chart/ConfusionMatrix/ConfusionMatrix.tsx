import { Axis, axisBottom, axisLeft, axisRight } from 'd3-axis';
import { RGBColor, color } from 'd3-color';
import { ScaleBand, ScaleLinear, scaleBand, scaleLinear } from 'd3-scale';
import { Selection, select } from 'd3-selection';
import {
  generateVerticalGradient,
  getAxesMargins,
  rotateAxis,
  tooltipAction
} from 'Utils/d3';
import useChart, { Margin } from 'Hooks/useChart';

import React from 'react';
import { interpolateHcl } from 'd3-interpolate';
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
  withBgBars?: boolean;
};
function ConfusionMatrix({ width, height, margin, data }: Props) {
  const { svg, chart, tooltip } = useChart({
    width,
    height,
    margin,
    initialize,
    useTooltip: true
  });

  let g: Selection<SVGGElement, unknown, null, undefined>;
  let xScale: ScaleBand<string>;
  let yScale: ScaleBand<string>;
  let colorScale: ScaleLinear<number, string>;
  let legendScale: ScaleBand<string>;
  let axes: Selection<SVGGElement, unknown, null, undefined>;
  let xAxis: Axis<string>;
  let yAxis: Axis<string>;
  let zAxis: Axis<string>;
  let xAxisG: Selection<SVGGElement, unknown, null, undefined>;
  let yAxisG: Selection<SVGGElement, unknown, null, undefined>;
  let zAxisG: Selection<SVGGElement, unknown, null, undefined>;
  let legendG: Selection<SVGGElement, unknown, null, undefined>;
  let cellsG: Selection<SVGGElement, unknown, null, undefined>;
  let cells: Selection<SVGGElement, D, SVGGElement, unknown>;
  let marginLeft: number;
  let marginTop: number;
  let sideMargin: number;

  let innerWidth: number = width - margin.left - margin.right;
  let innerHeight: number = height - margin.top - margin.bottom;

  function initialize() {
    const svgSelection = select(svg.current);
    marginLeft = margin.left;
    marginTop = margin.top;

    // Adds legend margin
    const legendMargin = width * LEGEND_MARGIN_PERC;
    innerWidth -= legendMargin;

    // Adds axis boxes margin
    const axisBoxSide = height * AXIS_BOX_HEIGHT_PERC;
    marginLeft += axisBoxSide;
    innerWidth -= axisBoxSide;
    innerHeight -= axisBoxSide;

    g = svgSelection.append('g');

    const xDomain = data.map((d: D) => d.x);
    const yDomain = data.map((d: D) => d.y);

    // Initialize scales
    xScale = scaleBand()
      .range([0, innerWidth])
      .domain(xDomain)
      .paddingInner(SCALE_PADDING_INNER)
      .paddingOuter(SCALE_PADDING_OUTER);

    yScale = scaleBand()
      .range([innerHeight, 0])
      .domain(yDomain.reverse())
      .paddingInner(SCALE_PADDING_INNER)
      .paddingOuter(SCALE_PADDING_OUTER);

    const colorDomain = Object.keys(COLORS).map(n => parseInt(n));

    ////////////////////////////////////////////////////////////////////////////////
    // TODO: FIX THIS
    // @ts-ignore
    colorScale = scaleLinear()
      .domain(colorDomain)
      // @ts-ignore
      .interpolate(interpolateHcl)
      // @ts-ignore
      .range(Object.values(COLORS));

    // Initialize axes
    xAxis = axisBottom(xScale).tickSize(0);
    yAxis = axisLeft(yScale).ticks(0);

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

    rotateAxis(xAxisG, -90);

    const [xAxisHeight, yAxisWidth] = getAxesMargins({
      xAxisG,
      yAxisG,
      padding: AXIS_PADDING
    });

    marginLeft += yAxisWidth;
    innerWidth -= yAxisWidth;
    innerHeight -= xAxisHeight;

    // Make chart squared
    sideMargin = (innerWidth - innerHeight) / 2;

    marginLeft += sideMargin;
    innerWidth -= sideMargin * 2;

    g.attr('transform', `translate(${marginLeft},${marginTop})`);

    xScale.range([0, innerWidth]);
    yScale.range([innerHeight, 0]);

    xAxis.scale(xScale);
    yAxis.scale(yScale).tickSize(0);

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);

    xAxisG.attr(
      'transform',
      `translate(0,${innerHeight + 4 + axisBoxSide + AXIS_PADDING})`
    );
    yAxisG.attr('transform', `translate(${-axisBoxSide - AXIS_PADDING},0)`);

    // Remove unwanted axes lines
    yAxisG.select('.domain').remove();
    xAxisG.select('.domain').remove();

    // Add axis boxes
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

    // Add legend
    legendG = g.append('g').classed(styles.legendG, true);

    const legendWidth = Math.min(xScale.bandwidth() / 2, legendMargin * 0.4);
    generateVerticalGradient(g, COLORS);

    legendG
      .append('rect')
      .classed(styles.legendRect, true)
      .attr('width', legendWidth)
      .attr('height', Math.max(0, innerHeight))
      .style('fill', 'url(#verticalGradient)')
      .attr('transform', `translate(${innerWidth + 40},0)`);

    legendScale = scaleBand()
      .range([innerHeight, 0])
      .domain(['10', '20', '30', '40', '50', '60', '70', '80', '90']);
    zAxis = axisRight(legendScale)
      .tickFormat((n: string) => `${n}%`)
      .tickSize(-legendWidth);

    zAxisG = legendG
      .append('g')
      .attr('transform', `translate(${innerWidth + legendWidth + 40},0)`)
      .classed(styles.zAxis, true)
      .call(zAxis);
    zAxisG.select('.domain').remove();

    // Initialize cells
    const cellWidth: number = xScale.bandwidth();
    const cellHeight: number = yScale.bandwidth();

    cellsG = g.append('g').classed(styles.cells, true);

    cells = cellsG
      .selectAll(`.${styles.cell}`)
      .data(data)
      .enter()
      .append('g')
      .classed(styles.cell, true);

    cells
      .append('rect')
      .attr('x', (d: D) => xScale(d.x) || 0)
      .attr('y', (d: D) => yScale(d.y) || 0)
      .attr('height', cellHeight)
      .attr('width', cellWidth)
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
      .attr('dy', cellHeight / 2)
      .classed(styles.cellText, true)
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${cellWidth / 2},0)`)
      .attr('fill', (d: D) => {
        const c: RGBColor = color(colorScale(d.value)) as RGBColor;
        return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > 90
          ? '#00252E'
          : '#CCF5FF';
      })
      .text((d: D) => `${d.value}%`);
  }

  const events = {
    cellHighlight: function(d: D, node: SVGRectElement, enter: boolean): void {
      const cellColor = color(colorScale(d.value));
      const newCellColor = enter
        ? cellColor && cellColor.darker(0.6)
        : cellColor;
      select(node)
        // @ts-ignore
        .attr('fill', newCellColor);

      if (enter) {
        const cellWidth: number = xScale.bandwidth();
        const cellHeight: number = yScale.bandwidth();
        const content = getTooltipContent(d);
        const dx = marginLeft + (xScale(d.x) || 0) + cellWidth / 2;
        const dy = marginTop + (yScale(d.y) || 0) + cellHeight / 2;
        tooltipAction.showTooltip({
          svg: svg.current,
          tooltip: tooltip.current,
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

export default ConfusionMatrix;
