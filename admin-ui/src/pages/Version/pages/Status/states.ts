import {
  NodeStatus,
  VersionStatus
} from '../../../../graphql/types/globalTypes';
import { GetVersionWorkflows_version_workflows_nodes } from '../../../../graphql/queries/types/GetVersionWorkflows';

export enum FinalStates {
  UP = 'UP',
  DOWN = 'DOWN',
  LOADING = 'LOADING'
}
const defaultState = FinalStates.DOWN;

const ProcessToFinal: Map<NodeStatus, FinalStates> = new Map([
  [NodeStatus.STARTED, FinalStates.UP],
  [NodeStatus.STOPPED, FinalStates.DOWN],
  [NodeStatus.ERROR, FinalStates.LOADING]
]);
const EdgeToFinal: Map<NodeStatus, FinalStates> = new Map([
  [NodeStatus.STARTED, FinalStates.UP],
  [NodeStatus.STOPPED, FinalStates.DOWN],
  [NodeStatus.ERROR, FinalStates.DOWN]
]);

export function getProcessState(processState: NodeStatus) {
  return ProcessToFinal.get(processState) || defaultState;
}

const nodeLoading = (node: GetVersionWorkflows_version_workflows_nodes) =>
  node.status === NodeStatus.ERROR;
export function getWorkflowState(
  versionState: VersionStatus,
  nodes: GetVersionWorkflows_version_workflows_nodes[] = []
) {
  switch (true) {
    case versionState === VersionStatus.PUBLISHED:
      return FinalStates.UP;
    case nodes.some(nodeLoading):
      return FinalStates.LOADING;
    default:
      return FinalStates.DOWN;
  }
}
export function getLinkState(processState: NodeStatus) {
  return EdgeToFinal.get(processState) || defaultState;
}
