/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetRuntime
// ====================================================

export interface GetRuntime_runtime {
  __typename: 'Runtime';
  id: string;
  name: string;
}

export interface GetRuntime {
  runtime: GetRuntime_runtime;
}

export interface GetRuntimeVariables {
  runtimeId: string;
}
