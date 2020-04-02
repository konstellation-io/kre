/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMetrics
// ====================================================

export interface GetMetrics_metrics_values_accuracy {
  __typename: 'MetricsAccuracy';
  total: number;
  micro: number;
  macro: number;
  weighted: number;
}

export interface GetMetrics_metrics_values {
  __typename: 'MetricsValues';
  accuracy: GetMetrics_metrics_values_accuracy;
  missing: number;
  newLabels: number;
}

export interface GetMetrics_metrics_charts_confusionMatrix {
  __typename: 'MetricChartData';
  x: string;
  y: string;
  z: string;
}

export interface GetMetrics_metrics_charts_seriesAccuracy {
  __typename: 'MetricChartData';
  x: string;
  y: string;
}

export interface GetMetrics_metrics_charts_seriesRecall {
  __typename: 'MetricChartData';
  x: string;
  y: string;
}

export interface GetMetrics_metrics_charts_seriesSupport {
  __typename: 'MetricChartData';
  x: string;
  y: string;
}

export interface GetMetrics_metrics_charts_successVsFails {
  __typename: 'MetricChartData';
  x: string;
  y: string;
}

export interface GetMetrics_metrics_charts {
  __typename: 'MetricsCharts';
  confusionMatrix: GetMetrics_metrics_charts_confusionMatrix[];
  seriesAccuracy: GetMetrics_metrics_charts_seriesAccuracy[];
  seriesRecall: GetMetrics_metrics_charts_seriesRecall[];
  seriesSupport: GetMetrics_metrics_charts_seriesSupport[];
  successVsFails: GetMetrics_metrics_charts_successVsFails[];
}

export interface GetMetrics_metrics {
  __typename: 'Metrics';
  values: GetMetrics_metrics_values;
  charts: GetMetrics_metrics_charts;
}

export interface GetMetrics {
  metrics: GetMetrics_metrics;
}

export interface GetMetricsVariables {
  runtimeId: string;
  versionId: string;
  startDate: string;
  endDate: string;
}
