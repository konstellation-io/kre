import React, { useRef, useEffect } from 'react';

import { select } from 'd3-selection';

function cleanup(component: any) {
  select(component)
    .selectAll('*')
    .remove();
}

type Props = {
  width: number;
  height: number;
  initialize: Function;
};
export default function useChart({ width, height, initialize }: Props) {
  const container = useRef(null);
  const svg = useRef(null);

  useEffect(() => {
    cleanup(svg.current);
    initialize();
  }, [width, height]);

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
