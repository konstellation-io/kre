import React, { useRef, useEffect } from 'react';
import useChart from '../../../hooks/useChart';

import styles from './BarChart.module.scss';

function BarChart({ width, height, margin, data }: any) {
  const { svg, chart } = useChart({ width, height, initialize });

  let g: any;
  let xScale: any;
  let yScale: any;

  const innerWidth: number = width - margin.left - margin.right;
  const innerHeight: number = height - margin.top - margin.bottom;

  function initialize() {}

  return chart;
}

export default BarChart;
