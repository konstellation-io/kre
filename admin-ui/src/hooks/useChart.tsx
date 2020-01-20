import React, { useRef, useEffect } from 'react';

import { select } from 'd3-selection';

function cleanup(component: any) {
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
};
export default function useChart({ width, height, margin, initialize }: Props) {
  const container = useRef(null);
  const svg = useRef(null);

  useEffect(() => {
    cleanup(svg.current);

    if (canBeRendered(width, height, margin)) {
      initialize();
    }
  }, [width, height, margin]);

  const chart = (
    <div ref={container} style={{ height: '100%' }}>
      <svg width={width} height={height} ref={svg} />
    </div>
  );

  return {
    svg,
    chart
  };
}
