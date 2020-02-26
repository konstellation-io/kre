import useChart, { Margin } from '../../../hooks/useChart';

import { getAxesMargins, getClassFromLabel } from '../../../utils/d3';

import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { axisBottom, axisLeft, Axis } from 'd3-axis';
import { select, Selection } from 'd3-selection';
import { max } from 'd3-array';

import styles from './BarChartSeries.module.scss';
import { get } from 'lodash';

const X_SCALE_PADDING_INNER: number = 0.45;
const X_SCALE_PADDING_OUTER: number = 0.5;
const PADDING_SERIE_LABEL: number = 30;
const PADDING_X_AXIS: number = 8;

export type Serie = {
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
  const { svg, chart } = useChart({
    width,
    height,
    margin,
    initialize
  });

  let g: Selection<SVGGElement, unknown, null, undefined>;
  let seriesScale: ScaleBand<string>;
  let xScale1: ScaleLinear<number, number>;
  let xScale2: ScaleLinear<number, number>;
  let yScale: ScaleBand<string>;
  let axes: Selection<SVGGElement, unknown, null, undefined>;
  let xAxis1: Axis<number | { valueOf(): number }>;
  let xAxis2: Axis<number | { valueOf(): number }>;
  let yAxis: Axis<string>;
  let yAxisG: Selection<SVGGElement, unknown, null, undefined>;
  let seriesG: Selection<SVGGElement, unknown, null, undefined>;
  let series: Selection<SVGGElement, Serie, SVGGElement, unknown>;
  let bars: Selection<SVGGElement, D, SVGGElement, unknown>;
  let barsG: Selection<SVGGElement, Serie, SVGGElement, unknown>;
  let rowBgG: Selection<SVGGElement, unknown, null, undefined>;
  let marginLeft: number;
  let marginTop: number;

  let innerWidth: number = width - margin.left - margin.right;
  let innerHeight: number =
    height - margin.top - margin.bottom - PADDING_SERIE_LABEL - PADDING_X_AXIS;

  function initialize() {
    const svgSelection = select(svg.current);
    marginLeft = margin.left;
    marginTop = margin.top + PADDING_SERIE_LABEL;

    g = svgSelection.append('g').classed(styles.g, true);
    rowBgG = g.append('g').classed(styles.rowBgG, true);

    const seriesDomain: string[] = data.map((d: Serie) => d.title);
    const xDomain: [number, number] = [0, 100];
    const xDomainSupport: [number, number] = [
      0,
      max(data[2].data, (d: D) => d.x) || 0
    ];
    let yDomain = data.reduce(
      (a: string[], b: Serie) => a.concat(b.data.map((c: D) => c.y)),
      []
    );
    yDomain = Array.from(new Set(yDomain));

    // Initialize scales
    seriesScale = scaleBand()
      .range([0, innerWidth])
      .paddingInner(0.3)
      .paddingOuter(0.15)
      .domain(seriesDomain);

    xScale1 = scaleLinear()
      .range([0, seriesScale.bandwidth()])
      .domain(xDomain);
    xScale2 = scaleLinear()
      .range([0, seriesScale.bandwidth()])
      .domain(xDomainSupport);

    yScale = scaleBand()
      .range([innerHeight, 0])
      .domain(yDomain)
      .paddingInner(X_SCALE_PADDING_INNER)
      .paddingOuter(X_SCALE_PADDING_OUTER);

    // Initialize axes
    yAxis = axisLeft(yScale).tickSize(0);
    xAxis1 = axisBottom(xScale1)
      .ticks(3)
      .tickFormat((text: number | { valueOf(): number }) => `${text}%`)
      .tickPadding(PADDING_X_AXIS);
    xAxis2 = axisBottom(xScale2)
      .ticks(3)
      .tickPadding(PADDING_X_AXIS);

    axes = g.append('g').classed(styles.axes, true);
    yAxisG = axes
      .append('g')
      .classed(styles.yAxis, true)
      .call(yAxis);

    let [xAxisHeight, yAxisWidth] = getAxesMargins({ yAxisG, padding: 8 });

    marginLeft += yAxisWidth;
    innerWidth -= yAxisWidth;
    innerHeight -= xAxisHeight;

    g.attr('transform', `translate(${marginLeft},${marginTop})`);

    seriesScale.range([0, innerWidth]);
    xScale1.range([0, seriesScale.bandwidth()]);
    xScale2.range([0, seriesScale.bandwidth()]);
    yScale.range([0, innerHeight]);

    yAxis.scale(yScale);
    yAxisG.call(yAxis);

    yAxisG
      .selectAll<SVGTextElement, string>('text')
      .attr('class', (d: string) => getClassFromLabel(d));

    // Remove unwanted axes lines
    yAxisG.select('.domain').remove();

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
    xAxis1.scale(xScale1).tickSize(-innerHeight);
    xAxis2.scale(xScale2).tickSize(-innerHeight);

    const percCharts = [data[0].title, data[1].title];

    series
      .append('g')
      .classed(styles.seriesAxis, true)
      .attr('transform', `translate(0,${innerHeight})`)
      .each(function(d: Serie) {
        const axis = percCharts.includes(d.title) ? xAxis1 : xAxis2;
        select(this).call(axis);
      });

    series
      .append('text')
      .classed(styles.seriesLabel, true)
      .attr('transform', `translate(0,${-PADDING_SERIE_LABEL / 2})`)
      .text((d: Serie) => d.title);

    series
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', innerHeight)
      .classed(styles.guideLine, true);
    series
      .append('line')
      .attr('x1', 0)
      .attr('y1', innerHeight)
      .attr('x2', seriesScale.bandwidth())
      .attr('y2', innerHeight)
      .classed(styles.guideLine, true);

    // Initialize row bg
    const barPadding = yScale.step() * yScale.paddingInner();
    const rowHeight = yScale.bandwidth() + barPadding;
    rowBgG
      .selectAll<SVGElement, D>(`.${styles.rowBg}`)
      .data(yDomain)
      .enter()
      .append('rect')
      .attr('class', (d: string) => getClassFromLabel(d))
      .classed(styles.rowBg, true)
      .attr('x', -yAxisWidth)
      .attr('y', (d: string) => (yScale(d) || 0) - barPadding / 2)
      .attr('width', innerWidth + yAxisWidth)
      .attr('height', rowHeight)
      .attr('fill', 'transparent')
      .attr('fill-opacity', 0.5)
      .on('mouseenter', function(d: string) {
        events.rowHighlight(d, true);
      })
      .on('mouseleave', function(d: string) {
        events.rowHighlight(d, false);
      });

    // Initialize bars
    const barHeight: number = yScale.bandwidth();
    barsG = series.append('g').classed(styles.bars, true);

    bars = barsG
      .selectAll(`.${styles.barG}`)
      .data((d: Serie) => d.data)
      .enter()
      .append('g')
      .attr('class', (d: D) => getClassFromLabel(d.y))
      .classed(styles.barG, true);
    bars
      .append('rect')
      .classed(styles.bar, true)
      .attr('x', 0)
      .attr('y', (d: D) => yScale(d.y) || 0)
      .attr('height', barHeight)
      .attr('width', function(d: D) {
        const parent = get(this, 'parentNode.parentNode') as SVGGElement;

        if (parent) {
          const title = select<SVGGElement, Serie>(parent).datum().title;
          const xScale = percCharts.includes(title) ? xScale1 : xScale2;
          return xScale(d.x);
        }

        return 0;
      });
    bars
      .append('text')
      .classed(styles.barValue, true)
      .attr('x', seriesScale.bandwidth() + 8)
      .attr('y', (d: D) => (yScale(d.y) || 0) + barHeight / 2)
      .text(function(d: D) {
        const parent = get(this, 'parentNode.parentNode') as SVGGElement;
        if (parent) {
          const title = select<SVGGElement, Serie>(parent).datum().title;
          const usePerc = percCharts.includes(title);
          return `${d.x}${usePerc ? '%' : ''}`;
        }
        return '';
      });
  }

  const events = {
    rowHighlight: function(label: string, enter: boolean): void {
      const groupClass = getClassFromLabel(label);

      const groupBars = g.selectAll(`.${groupClass}.${styles.barG}`);
      const groupBg = g.selectAll(`rect.${groupClass}.${styles.rowBg}`);
      const yLabel = g.select(`text.${groupClass}`);

      if (enter) {
        g.selectAll(`rect.${styles.bar}`).classed(styles.unhighlighted, true);

        groupBars.select('rect').classed(styles.highlighted, true);
        groupBars.select('text').classed(styles.highlighted, true);
        groupBg.attr('fill', 'black');

        yLabel.classed(styles.highlighted, true);
      } else {
        groupBg.attr('fill', 'transparent');

        g.selectAll(`rect.${styles.bar}`)
          .classed(styles.unhighlighted, false)
          .classed(styles.highlighted, false);
        g.selectAll(`text.${styles.barValue}`).classed(
          styles.highlighted,
          false
        );

        yLabel.classed(styles.highlighted, false);
      }
    }
  };

  return chart;
}

export default BarChartSeries;
