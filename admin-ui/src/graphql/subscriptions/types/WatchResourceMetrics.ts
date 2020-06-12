/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: WatchResourceMetrics
// ====================================================

export interface WatchResourceMetrics_watchResourceMetrics {
  __typename: 'ResourceMetric';
  date: string;
  cpu: number;
  mem: number;
}

export interface WatchResourceMetrics {
  watchResourceMetrics: WatchResourceMetrics_watchResourceMetrics[];
}

export interface WatchResourceMetricsVariables {
  versionId: string;
  fromDate: string;
}
