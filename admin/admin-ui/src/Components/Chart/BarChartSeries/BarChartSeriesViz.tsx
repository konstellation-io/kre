import { Axis, axisBottom, axisLeft } from 'd3-axis';
import {
  Margin,
  Padding,
  getAxisHeight,
  getAxisWidth,
  getClassFromLabel
} from 'Utils/d3';
import { ScaleBand, ScaleLinear, scaleBand, scaleLinear } from 'd3-scale';
import { Selection, select } from 'd3-selection';
import { get, indexOf } from 'lodash';

import { max } from 'd3-array';
import styles from './BarChartSeries.module.scss';

const X_SCALE_PADDING_INNER: number = 0.45;
const X_SCALE_PADDING_OUTER: number = 0.5;
const PADDING_SERIE_LABEL: number = 30;
const PADDING_X_AXIS: number = 8;
const X_DOMAIN_PERC: [number, number] = [0, 100];

export type Serie = {
  title: string;
  data: D[];
  perc: boolean;
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
  viewAllData: boolean;
};

class BarChartSeriesViz {
  props: Props;
  svg: Selection<SVGElement, unknown, null, undefined>;
  svgRef: SVGElement;
  g: Selection<SVGGElement, unknown, null, undefined>;
  seriesDomain: string[];
  seriesScale: ScaleBand<string>;
  xDomainSupport: [number, number];
  series: Selection<SVGGElement, Serie, SVGGElement, unknown> | null;
  xScales: ScaleLinear<number, number>[];
  xAxes: Axis<number | { valueOf(): number }>[];
  yScale: ScaleBand<string>;
  yDomain: string[];
  innerWidth: number;
  innerHeight: number;
  left: number;
  top: number;
  padding: Padding;

  constructor(svg: SVGElement, props: Props) {
    this.svg = select(svg);
    this.svgRef = svg;
    this.g = this.svg.append('g');
    this.props = props;

    this.innerWidth = props.width;
    this.innerHeight = props.height;
    this.xDomainSupport = [0, max(props.data[2].data, (d: D) => d.x) || 0];
    this.yDomain = Array.from(
      new Set(
        props.data.reduce(
          (a: string[], b: Serie) => a.concat(b.data.map((c: D) => c.y)),
          []
        )
      )
    );
    this.seriesDomain = props.data.map((d: Serie) => d.title);
    this.seriesScale = scaleBand();
    this.xAxes = [];
    this.xScales = [];
    this.yScale = scaleBand();
    this.left = 0;
    this.top = 0;
    this.series = null;
    this.padding = { top: 0, right: 0, bottom: 0, left: 0 };

    this.cleanup();
    this.initialize();
  }

  cleanup = () => {
    this.svg.selectAll('*').remove();
  };

  initialize = () => {
    const {
      props: { margin, viewAllData }
    } = this;

    // GET DIMENSIONS
    this.padding = this.getPaddings();

    this.left = margin.left + this.padding.left;
    this.top = margin.top + this.padding.top;

    this.innerWidth -= this.left + this.padding.right + margin.right;
    this.innerHeight -= this.top + this.padding.bottom + margin.bottom;

    // BUILD MAIN G ELEMENT
    this.g = this.svg
      .append('g')
      .classed(styles.g, true)
      .classed(styles.viewAllData, viewAllData)
      .attr('transform', `translate(${this.left},${this.top})`);

    this.createScales();
    this.createAxes();
    this.createSeries();
    this.createBars();
  };

  createScales = () => {
    const {
      innerWidth,
      innerHeight,
      seriesDomain,
      xDomainSupport,
      yDomain,
      props: { data }
    } = this;

    this.seriesScale = scaleBand()
      .range([0, innerWidth])
      .paddingInner(0.3)
      .paddingOuter(0.15)
      .domain(seriesDomain);

    data.forEach(({ perc }) => {
      this.xScales.push(
        scaleLinear()
          .range([0, this.seriesScale.bandwidth()])
          .domain(perc ? X_DOMAIN_PERC : xDomainSupport)
      );
    });

    this.yScale = scaleBand()
      .range([0, innerHeight])
      .domain(yDomain)
      .paddingInner(X_SCALE_PADDING_INNER)
      .paddingOuter(X_SCALE_PADDING_OUTER);
  };

  createAxes = () => {
    const {
      xScales,
      yScale,
      g,
      innerHeight,
      props: { data }
    } = this;

    const yAxis = axisLeft(yScale).tickSize(0);
    data.forEach(({ perc }, idx) => {
      this.xAxes.push(
        axisBottom(xScales[idx])
          .ticks(3)
          .tickFormat(
            (text: number | { valueOf(): number }) =>
              `${text}${perc ? '%' : ''}`
          )
          .tickPadding(PADDING_X_AXIS)
          .tickSize(-innerHeight)
      );
    });

    const axes = g.append('g').classed(styles.axes, true);
    const yAxisG = axes
      .append('g')
      .classed(styles.yAxis, true)
      .call(yAxis);

    yAxisG
      .selectAll<SVGTextElement, string>('text')
      .attr('class', (d: string) => getClassFromLabel(d));

    // Remove unwanted axes lines
    yAxisG.select('.domain').remove();
  };

  createSeries = () => {
    const {
      seriesScale,
      xAxes,
      innerHeight,
      g,
      props: { data }
    } = this;

    const seriesG = g.append('g').classed(styles.series, true);
    this.series = seriesG
      .selectAll(`.${styles.serieG}`)
      .data(data)
      .enter()
      .append('g')
      .classed(styles.serie, true)
      .attr('transform', (d: Serie) => `translate(${seriesScale(d.title)}, 0)`);

    this.series
      .append('g')
      .classed(styles.seriesAxis, true)
      .attr('transform', `translate(0,${innerHeight})`)
      .each(function(d: Serie, idx) {
        select(this).call(xAxes[idx]);
      });

    this.series
      .append('text')
      .classed(styles.seriesLabel, true)
      .attr('transform', `translate(0,${-PADDING_SERIE_LABEL / 2})`)
      .text((d: Serie) => d.title);

    this.series
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', innerHeight)
      .classed(styles.guideLine, true);
    this.series
      .append('line')
      .attr('x1', 0)
      .attr('y1', innerHeight)
      .attr('x2', seriesScale.bandwidth())
      .attr('y2', innerHeight)
      .classed(styles.guideLine, true);
  };

  getXScale = (item: SVGGElement) => {
    const {
      xScales,
      props: { data }
    } = this;

    const parent = get(item, 'parentNode.parentNode') as SVGGElement;
    let xScale;

    if (parent) {
      const title = select<SVGGElement, Serie>(parent).datum().title;
      const idx = indexOf(
        data.map(d => d.title),
        title
      );
      xScale = xScales[idx];
    }

    return xScale;
  };

  createBars = () => {
    const {
      yScale,
      yDomain,
      g,
      events,
      seriesScale,
      series,
      innerWidth,
      padding,
      getXScale,
      props: { viewAllData }
    } = this;

    // Initialize row bg
    const barPadding = yScale.step() * yScale.paddingInner();
    const rowHeight = yScale.bandwidth() + barPadding;

    g.insert('g', ':first-child')
      .classed(styles.rowBgG, true)
      .selectAll<SVGElement, D>(`.${styles.rowBg}`)
      .data(yDomain)
      .enter()
      .append('rect')
      .attr('class', (d: string) => getClassFromLabel(d))
      .classed(styles.rowBg, true)
      .attr('x', -padding.left)
      .attr('y', (d: string) => (yScale(d) || 0) - barPadding / 2)
      .attr('width', innerWidth + padding.left)
      .attr('height', rowHeight)
      .attr('fill', 'transparent')
      .attr('fill-opacity', 0.5)
      .on('mouseenter', function(_, d: string) {
        events.rowHighlight(d, true);
      })
      .on('mouseleave', function(_, d: string) {
        events.rowHighlight(d, false);
      });

    // Initialize bars
    const barHeight: number = yScale.bandwidth();

    if (!series) return;

    const barsG = series.append('g').classed(styles.bars, true);

    const bars = barsG
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
        const xScale = getXScale(this);
        return xScale ? xScale(d.x) : 0;
      });
    bars
      .append('text')
      .classed(styles.barValue, true)
      .attr('x', function(d: D) {
        const xScale = getXScale(this);

        return xScale && viewAllData
          ? xScale(d.x) + 16
          : seriesScale.bandwidth() + 8;
      })
      .attr('y', (d: D) => (yScale(d.y) || 0) + barHeight / 2)
      .text(function(d: D) {
        const parent = get(this, 'parentNode.parentNode');
        if (parent) {
          const usePerc = select<SVGGElement, Serie>(parent).datum().perc;
          return `${d.x}${usePerc ? '%' : ''}`;
        }
        return '';
      });
  };

  events = {
    rowHighlight: (label: string, enter: boolean) => {
      const { g } = this;

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

  getPaddings = () => {
    const { svg, yDomain } = this;

    let xAxisHeight = getAxisHeight(svg, ['100'], -45);
    let yAxisWidth = getAxisWidth(
      svg,
      yDomain.map(n => n.toString())
    );

    return {
      top: PADDING_SERIE_LABEL,
      right: 0,
      bottom: xAxisHeight,
      left: PADDING_X_AXIS + yAxisWidth
    } as Padding;
  };
}

export default BarChartSeriesViz;
