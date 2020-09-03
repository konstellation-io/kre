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
  const tooltip = useRef<HTMLDivElement>(null);

  useEffect(initialize, [width, height, data, viewAllData]);

  function initialize() {
    if (
      svg.current !== null &&
      tooltip.current !== null &&
      width * height !== 0
    ) {
      const vizProps = {
        width,
        height,
        data,
        margin,
        viewAllData
      };
      viz.current = new BarChartSeriesViz(
        svg.current,
        tooltip.current,
        vizProps
      );
    }
  }

  return (
    <>
      <svg width={width} height={height} ref={svg} />
      <div ref={tooltip} className="chartTooltip">
        <div className="tooltipContent" />
      </div>
    </>
  );
}

export default BarChartSeries;
