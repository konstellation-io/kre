/* tslint:disable */
/* eslint-disable */
// @generated
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
  id: string;
  name: string;
  nodes: GetVersionWorkflows_version_workflows_nodes[];
  edges: GetVersionWorkflows_version_workflows_edges[];
}

export interface GetVersionWorkflows_version_config {
  __typename: 'VersionConfig';
  completed: boolean;
}

export interface GetVersionWorkflows_version {
  __typename: 'Version';
  id: string;
  name: string;
  status: VersionStatus;
  creationDate: string;
  workflows: GetVersionWorkflows_version_workflows[];
  config: GetVersionWorkflows_version_config;
}

export interface GetVersionWorkflows {
  version: GetVersionWorkflows_version;
}

export interface GetVersionWorkflowsVariables {
  versionId: string;
}
