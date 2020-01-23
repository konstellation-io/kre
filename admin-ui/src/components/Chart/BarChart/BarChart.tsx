import useChart, { Margin } from '../../../hooks/useChart';

import { getAxesMargins, rotateAxis } from '../../../utils/d3';

import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { color, RGBColor } from 'd3-color';

import styles from './BarChart.module.scss';

const X_SCALE_PADDING_INNER: number = 0.3;
const X_SCALE_PADDING_OUTER: number = 0.4;
const DEFAULT_BAR_COLOR: RGBColor = color('#007c99') as RGBColor;

type D = {
  x: string;
  y: number;
};

type Props = {
  width: number;
  height: number;
  margin: Margin;
  data: D[];
  withBgBars?: boolean;
};
function BarChart({ width, height, margin, data, withBgBars }: Props) {
  const { svg, chart } = useChart({ width, height, margin, initialize });

  let g: any;
  let xScale: ScaleBand<string>;
  let yScale: ScaleLinear<number, number>;
  let axes: any;
  let xAxis: any;
  let yAxis: any;
  let xAxisG: any;
  let yAxisG: any;
  let barsG: any;
  let bars: any;
  let bgBarsG: any;
  let bgBars: any;
  let marginLeft: number;
  let marginTop: number;

  let innerWidth: number = width - margin.left - margin.right;
  let innerHeight: number = height - margin.top - margin.bottom;

  function initialize() {
    const svgSelection = select(svg.current);
    marginLeft = margin.left;
    marginTop = margin.top;

    g = svgSelection.append('g');

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
    xAxis = axisBottom(xScale).tickSize(0);
    yAxis = axisLeft(yScale).ticks(4);

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

    // rotateAxis(xAxisG, -45);

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

    // Initialize bars
    const barWidth: number = xScale.bandwidth();

    bgBarsG = g.append('g').classed(styles.bars, true);
    barsG = g.append('g').classed(styles.bars, true);

    if (withBgBars) {
      bgBars = bgBarsG
        .selectAll(`.${styles.bgBar}`)
        .data(data)
        .enter()
        .append('rect')
        .classed(styles.bgBar, true)
        .attr('x', (d: D) => xScale(d.x))
        .attr('y', (d: D) => yScale(100))
        .attr('height', (d: D) => innerHeight - yScale(100))
        .attr('width', barWidth)
        .attr('rx', 5);
    }

    bars = barsG
      .selectAll(`.${styles.bar}`)
      .data(data)
      .enter()
      .append('rect')
      .classed(styles.bar, true)
      .attr('x', (d: D) => xScale(d.x))
      .attr('y', (d: D) => yScale(d.y))
      .attr('height', (d: D) => innerHeight - yScale(d.y))
      .attr('width', barWidth)
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
    }
  };

  return chart;
}

export default BarChart;
