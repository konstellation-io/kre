import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';

import { GetVersionWorkflows_version_workflows_nodes } from 'Graphql/queries/types/GetVersionWorkflows';

export enum FinalStates {
  UP = 'UP',
  DOWN = 'DOWN',
  LOADING = 'LOADING',
  ERROR = 'ERROR'
}
const defaultState = FinalStates.DOWN;

const ProcessToFinal: Map<NodeStatus, FinalStates> = new Map([
  [NodeStatus.STARTING, FinalStates.LOADING],
  [NodeStatus.STARTED, FinalStates.UP],
  [NodeStatus.STOPPED, FinalStates.DOWN],
  [NodeStatus.ERROR, FinalStates.ERROR]
]);
const EdgeToFinal: Map<NodeStatus, FinalStates> = new Map([
  [NodeStatus.STARTING, FinalStates.DOWN],
  [NodeStatus.STARTED, FinalStates.UP],
  [NodeStatus.STOPPED, FinalStates.DOWN],
  [NodeStatus.ERROR, FinalStates.ERROR]
]);

export function getProcessState(processState: NodeStatus) {
  return ProcessToFinal.get(processState) || defaultState;
}

const nodeLoading = (node: GetVersionWorkflows_version_workflows_nodes) =>
  node.status === NodeStatus.STARTING;
const nodeError = (node: GetVersionWorkflows_version_workflows_nodes) =>
  node.status === NodeStatus.ERROR;
export function getWorkflowState(
  versionState: VersionStatus,
  nodes: GetVersionWorkflows_version_workflows_nodes[] = []
) {
  switch (true) {
    case nodes.some(nodeLoading):
      return FinalStates.LOADING;
    case nodes.some(nodeError):
      return FinalStates.ERROR;
    case versionState === VersionStatus.PUBLISHED:
      return FinalStates.UP;
    default:
      return FinalStates.DOWN;
  }
}
export function getLinkState(processState: NodeStatus) {
  return EdgeToFinal.get(processState) || defaultState;
}
