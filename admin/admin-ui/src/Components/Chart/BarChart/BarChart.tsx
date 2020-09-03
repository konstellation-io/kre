import React, { useEffect, useRef } from 'react';

import BarChartViz from './BarChartViz';
import { D } from './BarChartViz';
import { Margin } from 'Utils/d3';

type Props = {
  data: D[];
  width: number;
  height: number;
  margin: Margin;
  viewAllData: boolean;
};

function BarChart({ data, width, height, margin, viewAllData }: Props) {
  const viz = useRef<BarChartViz | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);

  useEffect(initialize, [width, height, data]);

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
      viz.current = new BarChartViz(svg.current, tooltip.current, vizProps);
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

export default BarChart;
