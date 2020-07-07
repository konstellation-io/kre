import React, { useEffect, useRef } from 'react';

import { select } from 'd3-selection';

import styles from './useChart.module.scss';

function cleanup(component: SVGSVGElement) {
  select(component)
    .selectAll('*')
    .remove();
}

function canBeRendered(
  width: number,
  height: number,
  margin?: Margin
): boolean {
  const horizontalMargin: number = (margin && margin.left + margin.right) || 0;
  const verticalMargin: number = (margin && margin.top + margin.bottom) || 0;
  const widthOk: boolean = width > 0 && width > horizontalMargin;
  const heightOk: boolean = height > 0 && height > verticalMargin;

  return widthOk && heightOk;
}

export type Margin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
type Props = {
  width: number;
  height: number;
  margin?: Margin;
  initialize: Function;
  useTooltip?: boolean;
  chartId?: string;
  removeUpdate?: boolean;
};
export default function useChart({
  width,
  height,
  margin,
  initialize,
  useTooltip = false,
  removeUpdate = false
}: Props) {
  const container = useRef(null);
  const svg = useRef<SVGSVGElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!removeUpdate) {
      if (svg.current) {
        cleanup(svg.current);
      }

      if (canBeRendered(width, height, margin)) {
        initialize();
      }
    }
  }, [width, height, margin, initialize, removeUpdate]);

  const chart = (
    <div ref={container} className={styles.container}>
      <svg width={width} height={height} ref={svg} />
      {useTooltip && (
        <div ref={tooltip} className="chartTooltip">
          <div className="tooltipContent" />
        </div>
      )}
    </div>
  );

  return {
    svg,
    chart,
    tooltip
  };
}
