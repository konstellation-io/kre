/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { VersionStatus, NodeStatus } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetVersionWorkflows
// ====================================================

export interface GetVersionWorkflows_version_workflows_nodes {
  __typename: 'Node';
  id: string;
  name: string;
  status: NodeStatus;
}

export interface GetVersionWorkflows_version_workflows_edges {
  __typename: 'Edge';
  id: string;
  fromNode: string;
  toNode: string;
}

export interface GetVersionWorkflows_version_workflows {
  __typename: 'Workflow';
  name: string;
  nodes: GetVersionWorkflows_version_workflows_nodes[];
  edges: GetVersionWorkflows_version_workflows_edges[];
}

export interface GetVersionWorkflows_version {
  __typename: 'Version';
  name: string;
  status: VersionStatus;
  workflows: GetVersionWorkflows_version_workflows[];
  configurationCompleted: boolean;
}

export interface GetVersionWorkflows {
  version: GetVersionWorkflows_version;
}

export interface GetVersionWorkflowsVariables {
  versionId: string;
}
