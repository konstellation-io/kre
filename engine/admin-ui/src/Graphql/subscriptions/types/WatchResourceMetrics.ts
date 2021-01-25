/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: WatchResourceMetrics
// ====================================================

export interface WatchResourceMetrics_watchResourceMetrics {
  __typename: 'ResourceMetrics';
  date: string;
  cpu: number;
  mem: number;
}

export interface WatchResourceMetrics {
  watchResourceMetrics: WatchResourceMetrics_watchResourceMetrics[];
}

export interface WatchResourceMetricsVariables {
  versionName: string;
  fromDate: string;
}
