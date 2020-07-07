import BarChartSeries, {
  Serie
} from 'Components/Chart/BarChartSeries/BarChartSeries';
import {
  GetMetrics_metrics_charts_seriesAccuracy,
  GetMetrics_metrics_charts_seriesRecall,
  GetMetrics_metrics_charts_seriesSupport
} from 'Graphql/queries/types/GetMetrics';
import React, { useRef } from 'react';

import Box from '../../components/Box/Box';
import ExpandButton from '../../components/Box/ExpandButton';
import Title from '../../components/Box/Title';
import styles from './LabelStats.module.scss';
import useRenderOnResize from 'Hooks/useRenderOnResize';

type MetricData =
  | GetMetrics_metrics_charts_seriesAccuracy
  | GetMetrics_metrics_charts_seriesRecall
  | GetMetrics_metrics_charts_seriesSupport;

type GetMetricsSeries = {
  Accuracy: GetMetrics_metrics_charts_seriesAccuracy[];
  Recall: GetMetrics_metrics_charts_seriesRecall[];
  Support: GetMetrics_metrics_charts_seriesSupport[];
};

function formatData(data: GetMetricsSeries): Serie[] {
  return Object.entries(data).map(
    ([title, values]: [string, MetricData[]]) => ({
      title,
      data: values.map((d: MetricData) => ({
        x: parseInt(d.x),
        y: d.y
      }))
    })
  );
}

type Props = {
  withBgBars?: boolean;
  toggleExpanded?: Function;
  nodeId?: string;
  data: GetMetricsSeries;
  viewAllData: boolean;
};
function LabelStats({
  withBgBars = false,
  toggleExpanded,
  nodeId,
  data,
  viewAllData
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
          data={formatData(data)}
          withBgBars={withBgBars}
          viewAllData={viewAllData}
        />
      </div>
    </Box>
  );
}

export default LabelStats;
