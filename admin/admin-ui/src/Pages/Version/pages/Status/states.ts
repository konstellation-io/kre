import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';

export enum FinalStates {
  DOWN = 'DOWN',
  LOADING = 'LOADING',
  READY = 'READY',
  UP = 'UP',
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

export function getEntrypointState(
  versionStatus: VersionStatus,
  entrypointStatus: NodeStatus
) {
  const versionPublished = versionStatus === VersionStatus.PUBLISHED;

  switch (true) {
    case entrypointStatus === NodeStatus.ERROR:
      return FinalStates.ERROR;
    case entrypointStatus === NodeStatus.STARTING:
      return FinalStates.LOADING;
    case entrypointStatus === NodeStatus.STARTED:
      return versionPublished ? FinalStates.UP : FinalStates.READY;
    default:
      return FinalStates.DOWN;
  }
}

type NodeWStatus = {
  status: NodeStatus;
};
const nodeLoading = (node: NodeWStatus) => node.status === NodeStatus.STARTING;
const nodeError = (node: NodeWStatus) => node.status === NodeStatus.ERROR;
export function getWorkflowState(
  versionState: VersionStatus,
  nodes: NodeWStatus[] = [],
  entrypointStatus: NodeStatus
) {
  const entrypointNode: NodeWStatus = { status: entrypointStatus };
  const allNodes: NodeWStatus[] = nodes.concat([entrypointNode]);

  switch (true) {
    case allNodes.some(nodeLoading):
      return FinalStates.LOADING;
    case allNodes.some(nodeError):
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
