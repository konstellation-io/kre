import React from 'react';

import useChart, { Margin } from '../../../hooks/useChart';

import { getAxesMargins, tooltipAction } from '../../../utils/d3';

import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { color, RGBColor } from 'd3-color';

import styles from './BarChartSeries.module.scss';

const X_SCALE_PADDING_INNER: number = 0.4;
const X_SCALE_PADDING_OUTER: number = 0.3;
const DEFAULT_BAR_COLOR: RGBColor = color('#007c99') as RGBColor;

function getTooltipContent(d: D) {
  return (
    <div>
      <div>{`${d.y}: ${d.x}`}</div>
    </div>
  );
}

type Serie = {
  title: string;
  data: D[];
};

type D = {
  x: number;
  y: string;
};

type Props = {
  width: number;
  height: number;
  margin: Margin;
  data: Serie[];
  withBgBars?: boolean;
};
function BarChartSeries({ width, height, margin, data }: Props) {
  const { svg, chart, tooltip } = useChart({
    width,
    height,
    margin,
    initialize,
    useTooltip: true
  });

  let g: any;
  let seriesScale: ScaleBand<string>;
  let xScale: ScaleLinear<number, number>;
  let yScale: ScaleBand<string>;
  let axes: any;
  let xAxis: any;
  let yAxis: any;
  let xAxisG: any;
  let yAxisG: any;
  let seriesG: any;
  let series: any;
  let bars: any;
  let barsG: any;
  let rowBgG: any;
  let rowsBg: any;
  let marginLeft: number;
  let marginTop: number;

  let innerWidth: number = width - margin.left - margin.right;
  let innerHeight: number = height - margin.top - margin.bottom;

  function initialize() {
    const svgSelection = select(svg.current);
    marginLeft = margin.left;
    marginTop = margin.top;

    g = svgSelection.append('g');

    const seriesDomain: string[] = data.map((d: Serie) => d.title);
    const xDomain: [number, number] = [0, 100];
    let yDomain = data.reduce(
      (a: string[], b: Serie) => a.concat(b.data.map((c: D) => c.y)),
      []
    );
    yDomain = Array.from(new Set(yDomain));

    // Initialize scales
    seriesScale = scaleBand()
      .range([0, innerWidth])
      .paddingInner(0.1)
      .paddingOuter(0.1)
      .domain(seriesDomain);

    xScale = scaleLinear()
      .range([0, seriesScale.bandwidth()])
      .domain(xDomain);

    yScale = scaleBand()
      .range([innerHeight, 0])
      .domain(yDomain)
      .paddingInner(X_SCALE_PADDING_INNER)
      .paddingOuter(X_SCALE_PADDING_OUTER);

    // Initialize axes
    yAxis = axisLeft(yScale).tickSize(0);
    xAxis = axisBottom(xScale)
      .ticks(4)
      .tickFormat((text: number | { valueOf(): number }) => `${text}%`);

    axes = g.append('g').classed(styles.axes, true);
    yAxisG = axes
      .append('g')
      .classed(styles.yAxis, true)
      .call(yAxis);

    const [xAxisHeight, yAxisWidth] = getAxesMargins({ yAxisG });

    marginLeft += yAxisWidth;
    innerWidth -= yAxisWidth;

    g.attr('transform', `translate(${marginLeft},${marginTop})`);

    seriesScale.range([0, innerWidth]);
    xScale.range([0, seriesScale.bandwidth()]);

    yScale.range([innerHeight, 0]);
    yAxis.scale(yScale);
    yAxisG.call(yAxis);

    // Remove unwanted axes lines
    yAxisG.select('.domain').remove();
    // xAxisG.select('.domain').remove();

    // Initialize Series
    seriesG = g.append('g').classed(styles.series, true);
    series = seriesG
      .selectAll(`.${styles.serieG}`)
      .data(data)
      .enter()
      .append('g')
      .classed(styles.serie, true)
      .attr('transform', (d: Serie) => `translate(${seriesScale(d.title)}, 0)`);

    // Add X axis to series
    xAxis.scale(xScale).tickSize(-innerHeight);

    series
      .append('g')
      .classed(styles.seriesAxis, true)
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    // Initialize row bg
    rowBgG = g.append('g').classed(styles.rowBgG, true);
    const rowHeight = +yScale.bandwidth + +yScale.paddingInner / 2;
    rowsBg = rowBgG
      .selectAll(`.${styles.rowBg}`)
      .data(yDomain)
      .enter()
      .append('rect')
      .classed(styles.rowBg, true)
      .attr('x', -yAxisWidth)
      .attr('y', (d: string) => yScale(d))
      .attr('width', innerWidth + yAxisWidth)
      .attr('height', yScale.bandwidth)
      .attr('fill', 'red');

    // Initialize bars
    const barHeight: number = yScale.bandwidth();
    barsG = series.append('g').classed(styles.bars, true);

    bars = barsG
      .selectAll(`.${styles.bar}`)
      .data((d: Serie) => d.data)
      .enter()
      .append('rect')
      .classed(styles.bar, true)
      .attr('x', 0)
      .attr('y', (d: D) => yScale(d.y))
      .attr('height', barHeight)
      .attr('width', (d: D) => xScale(d.x))
      .attr('rx', 5)
      .attr('fill', DEFAULT_BAR_COLOR)
      .on('mouseenter', function(d: D) {
        // @ts-ignore
        events.barHighlight(d, this, true);
      })
      .on('mouseleave', function(d: D) {
        // @ts-ignore
        events.barHighlight(d, this, false);
      });
  }

  const events = {
    barHighlight: function(d: D, node: any, enter: boolean): void {
      const newBarColor = enter
        ? DEFAULT_BAR_COLOR.brighter(0.6)
        : DEFAULT_BAR_COLOR;
      select(node)
        // @ts-ignore
        .attr('fill', newBarColor);

      if (enter) {
        // @ts-ignore
        const serieTitle = select(node.parentNode).datum().title;

        const barHeight: number = yScale.bandwidth();
        const barWidth: number = xScale(d.x);
        const serieOffset: number = seriesScale(serieTitle) || 0;
        const content = getTooltipContent(d);
        const dx = marginLeft + serieOffset + barWidth;
        const dy = marginTop + (yScale(d.y) || 0) + barHeight / 2;
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

export default BarChartSeries;
