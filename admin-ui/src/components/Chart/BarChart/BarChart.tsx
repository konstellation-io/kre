import React, { useRef, useEffect } from 'react';
import useChart from '../../../hooks/useChart';

import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

import styles from './BarChart.module.scss';

const X_SCALE_PADDING_INNER = 0.2;
const X_SCALE_PADDING_OUTER = 0.4;

type DataNode = {
  x: string;
  y: number;
};

type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type Props = {
  width: number;
  height: number;
  margin: Margin;
  data: DataNode[];
};
function BarChart({ width, height, margin, data }: any) {
  const { svg, chart } = useChart({ width, height, initialize });

  let g: any;
  let xScale: ScaleBand<string>;
  let yScale: ScaleLinear<number, number>;
  let xAxis: any;
  let yAxis: any;
  let barsG: any;
  let bars: any;

  const innerWidth: number = width - margin.left - margin.right;
  const innerHeight: number = height - margin.top - margin.bottom;

  function initialize() {
    const svgSelection = select(svg.current);

    g = svgSelection
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Initialize scales
    xScale = scaleBand()
      .range([])
      .domain([])
      .paddingInner(X_SCALE_PADDING_INNER)
      .paddingOuter(X_SCALE_PADDING_OUTER);

    yScale = scaleLinear()
      .range([])
      .domain([]);

    // Initialize axes

    // Initialize bars
    barsG = g.append('g').classed(styles.bars, true);

    bars = barsG
      .select(`.${styles.bar}`)
      .data(data)
      .enter()
      .append('rect')
      .classed(styles.bar, true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 100)
      .attr('width', 20)
      .attr('fill', 'red');
  }

  const events = {
    barHightlight: function(d: DataNode) {}
  };

  return chart;
}

export default BarChart;
