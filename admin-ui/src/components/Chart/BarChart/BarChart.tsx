import useChart, { Margin } from '../../../hooks/useChart';

import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { max } from 'd3-array';

import styles from './BarChart.module.scss';

const X_SCALE_PADDING_INNER = 0.2;
const X_SCALE_PADDING_OUTER = 0.4;

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

  let innerWidth: number = width - margin.left - margin.right;
  let innerHeight: number = height - margin.top - margin.bottom;

  function initialize() {
    const svgSelection = select(svg.current);

    g = svgSelection
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    g.append('rect').attr('fill');

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

    // Recalculate margins with the new axis sizes
    let xAxisHeight = 0;
    let yAxisWidth = 0;

    xAxisG.selectAll('text').each(function() {
      // @ts-ignore
      const actHeight = this.getBBox().height;
      if (actHeight > xAxisHeight) xAxisHeight = actHeight;
    });
    yAxisG.selectAll('text').each(function() {
      // @ts-ignore
      const actWidth = this.getBBox().width;
      if (actWidth > yAxisWidth) yAxisWidth = actWidth;
    });
    yAxisWidth += 6;

    xScale.range([yAxisWidth, innerWidth]);
    yScale.range([innerHeight - xAxisHeight, 0]);

    xAxisG.attr('transform', `translate(0,${innerHeight - xAxisHeight + 8})`);
    yAxisG.attr('transform', `translate(${yAxisWidth},0)`);

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
        .attr('height', (d: D) => innerHeight - xAxisHeight - yScale(100))
        .attr('width', barWidth)
        .attr('rx', barWidth / 2);
    }

    bars = barsG
      .selectAll(`.${styles.bar}`)
      .data(data)
      .enter()
      .append('rect')
      .classed(styles.bar, true)
      .attr('x', (d: D) => xScale(d.x))
      .attr('y', (d: D) => yScale(d.y))
      .attr('height', (d: D) => innerHeight - xAxisHeight - yScale(d.y))
      .attr('width', barWidth)
      .attr('rx', barWidth / 2);
  }

  const events = {
    barHighlight: function(d: D) {},
    barUnhighlight: function(d: D) {}
  };

  return chart;
}

export default BarChart;
