/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetResourceMetrics
// ====================================================

export interface GetResourceMetrics_resourceMetrics {
  __typename: 'ResourceMetric';
  date: string;
  cpu: number;
  mem: number;
}

export interface GetResourceMetrics {
  resourceMetrics: GetResourceMetrics_resourceMetrics[];
}

export interface GetResourceMetricsVariables {
  versionId: string;
  fromDate: string;
  toDate: string;
}
