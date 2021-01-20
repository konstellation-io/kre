import BarChartSeriesViz, { Serie } from './BarChartSeriesViz';
import React, { useEffect, useRef } from 'react';

import { Margin } from 'Utils/d3';

type Props = {
  data: Serie[];
  width: number;
  height: number;
  margin: Margin;
  viewAllData: boolean;
};

function BarChartSeries({ data, width, height, margin, viewAllData }: Props) {
  const viz = useRef<BarChartSeriesViz | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(initialize, [width, height, data, viewAllData]);

  function initialize() {
    if (svg.current !== null && width * height !== 0) {
      const vizProps = {
        width,
        height,
        data,
        margin,
        viewAllData
      };
      viz.current = new BarChartSeriesViz(svg.current, vizProps);
    }
  }

  return (
    <>
      <svg width={width} height={height} ref={svg} />
    </>
  );
}

export default BarChartSeries;
