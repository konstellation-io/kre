import React, { useRef } from 'react';
import useRenderOnResize from '../../../../../../hooks/useRenderOnResize';

import Box from '../../components/Box/Box';
import Title from '../../components/Box/Title';
import ExpandButton from '../../components/Box/ExpandButton';
import BarChartSeries, {
  Serie
} from '../../../../../../components/Chart/BarChartSeries/BarChartSeries';

import styles from './LabelStats.module.scss';

type Props = {
  withBgBars?: boolean;
  toggleExpanded?: Function;
  nodeId?: string;
  data: Serie[];
};
function LabelStats({
  withBgBars = false,
  toggleExpanded,
  nodeId,
  data
}: Props) {
  const container = useRef(null);
  const { width, height } = useRenderOnResize({ container });
  return (
    <Box>
      <Title text="" />
      <ExpandButton
        onClick={() => {
          toggleExpanded && toggleExpanded(nodeId);
        }}
      />
      <div className={styles.chartContainer} ref={container}>
        <BarChartSeries
          width={width}
          height={height}
          margin={{
            top: 8,
            right: 14,
            bottom: 12,
            left: 30
          }}
          data={data}
          withBgBars={withBgBars}
        />
      </div>
    </Box>
  );
}

export default LabelStats;
