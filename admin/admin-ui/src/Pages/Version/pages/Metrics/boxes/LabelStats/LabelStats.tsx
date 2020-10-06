import {
  GetMetrics_metrics_charts_seriesAccuracy,
  GetMetrics_metrics_charts_seriesRecall,
  GetMetrics_metrics_charts_seriesSupport
} from 'Graphql/queries/types/GetMetrics';
import React, { useRef } from 'react';

import BarChartSeries from 'Components/Chart/BarChartSeries/BarChartSeries';
import Box from '../../components/Box/Box';
import ExpandButton from '../../components/Box/ExpandButton';
import Info from '../../components/Box/Info';
import { Serie } from 'Components/Chart/BarChartSeries/BarChartSeriesViz';
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

// Only first and second charts show percentual values
const PERC_STATS = [true, true, false];

function formatData(data: GetMetricsSeries): Serie[] {
  return Object.entries(data).map(
    ([title, values]: [string, MetricData[]], idx) => ({
      title,
      data: values.map((d: MetricData) => ({
        x: parseInt(d.x),
        y: d.y
      })),
      perc: PERC_STATS[idx]
    })
  );
}

type Props = {
  withBgBars?: boolean;
  toggleExpanded?: Function;
  nodeId?: string;
  data: GetMetricsSeries;
  viewAllData: boolean;
  info: string;
};
function LabelStats({
  toggleExpanded,
  nodeId,
  data,
  viewAllData,
  info
}: Props) {
  const container = useRef(null);
  const { width, height } = useRenderOnResize({ container });
  return (
    <Box>
      <Title text="" />
      <Info>{info}</Info>
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
          viewAllData={viewAllData}
        />
      </div>
    </Box>
  );
}

export default LabelStats;
