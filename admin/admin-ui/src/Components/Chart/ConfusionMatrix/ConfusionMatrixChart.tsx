import React, { useEffect, useRef } from 'react';

import ConfusionMatrixViz from './ConfusionMatrixViz';
import { D } from './ConfusionMatrixViz';
import { Margin } from 'Utils/d3';
import tooltipStyles from 'Styles/tooltip.module.scss';

type Props = {
  data: D[];
  width: number;
  height: number;
  margin: Margin;
};

function ConfusionMatrixChart({ data, width, height, margin }: Props) {
  const viz = useRef<ConfusionMatrixViz | null>(null);
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
        margin
      };
      viz.current = new ConfusionMatrixViz(
        svg.current,
        tooltip.current,
        vizProps
      );
    }
  }

  return (
    <>
      <svg width={width} height={height} ref={svg} />
      <div ref={tooltip} className={tooltipStyles.container}>
        <div className={tooltipStyles.content} />
      </div>
    </>
  );
}

export default ConfusionMatrixChart;
