import React, { useRef, useEffect } from 'react';

import { select } from 'd3-selection';

function cleanup(component: any) {
  select(component)
    .selectAll('*')
    .remove();
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
    initialize();
  }, [width, height, margin]);

  const chart = (
    <div ref={container} style={{ height: '100%' }}>
      <svg width={width} height={height} ref={svg} style={{ cursor: 'grab' }} />
    </div>
  );

  return {
    svg,
    chart
  };
}
