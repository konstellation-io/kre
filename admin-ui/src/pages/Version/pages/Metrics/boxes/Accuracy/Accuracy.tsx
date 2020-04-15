import React, { useRef } from 'react';
import useRenderOnResize from '../../../../../../hooks/useRenderOnResize';

import Box from '../../components/Box/Box';
import Title from '../../components/Box/Title';
import ExpandButton from '../../components/Box/ExpandButton';
import BarChart, {
  D
} from '../../../../../../components/Chart/BarChart/BarChart';

import styles from './Accuracy.module.scss';
import { GetMetrics_metrics_charts_successVsFails } from '../../../../../../graphql/queries/types/GetMetrics';

function formatData(data: GetMetrics_metrics_charts_successVsFails[]): D[] {
  return data.map((chartBar: GetMetrics_metrics_charts_successVsFails) => {
    const noData = chartBar.y === '';
    return {
      x: chartBar.x,
      y: noData ? 0 : parseInt(chartBar.y),
      empty: noData
    };
  });
}

type Props = {
  withBgBars?: boolean;
  toggleExpanded?: Function;
  nodeId?: string;
  data: GetMetrics_metrics_charts_successVsFails[];
};
function Accuracy({ toggleExpanded, nodeId, data }: Props) {
  const container = useRef(null);
  const { width, height } = useRenderOnResize({ container });
  return (
    <Box>
      <Title text="Hits VS Fails" />
      <ExpandButton
        onClick={() => {
          toggleExpanded && toggleExpanded(nodeId);
        }}
      />
      <div className={styles.chartContainer} ref={container}>
        <BarChart
          width={width}
          height={height}
          margin={{
            top: 40,
            right: 14,
            bottom: 23,
            left: 14
          }}
          data={formatData(data)}
        />
      </div>
    </Box>
  );
}

export default Accuracy;
