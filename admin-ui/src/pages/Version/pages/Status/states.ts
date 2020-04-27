import {
  NodeStatus,
  VersionStatus
} from '../../../../graphql/types/globalTypes';

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
const WorkflowToFinal: Map<VersionStatus, FinalStates> = new Map([
  [VersionStatus.PUBLISHED, FinalStates.UP],
  [VersionStatus.STARTED, FinalStates.DOWN],
  [VersionStatus.STOPPED, FinalStates.DOWN],
  [VersionStatus.STARTING, FinalStates.DOWN]
]);

export function getProcessState(processState: NodeStatus) {
  return ProcessToFinal.get(processState) || defaultState;
}
export function getWorkflowState(versionState: VersionStatus) {
  return WorkflowToFinal.get(versionState) || defaultState;
}
export function getLinkState(processState: NodeStatus) {
  return EdgeToFinal.get(processState) || defaultState;
}
