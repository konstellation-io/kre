import {NodeStatus} from "Graphql/types/globalTypes";
import {
  GetVersionWorkflows_version_workflows,
  GetVersionWorkflows_version_workflows_nodes
} from "Graphql/queries/types/GetVersionWorkflows";

export interface NodeWithStatus {
  id: string;
  name: string;
  status: NodeStatus;
  subscriptions?: string[] | null;
}

interface ForcePostitions {
  x: number;
  y: number;
}

export interface NodeWithPosition extends NodeWithStatus, ForcePostitions {}

export function getMaxNodesSubs(nodes: NodeWithStatus[]) {
  return nodes
    .map(node => node.subscriptions?.length ?? 0)
    .reduce((prev, actual)  => actual > prev ? actual: prev, 1)
}

export function getGraphData(workflow: GetVersionWorkflows_version_workflows, entrypointStatus: NodeStatus) {
  const entrypointNode = {
    id: "entrypoint",
    name: "entrypoint",
    status: entrypointStatus,
  }
  const nodes: NodeWithStatus[] = [
    entrypointNode,
    ...workflow.nodes
      .map((node) => ({ id: node.id, name: node.name, status: node.status})),
  ]
  const links = [ {source: workflow.exitpoint ?? 'exitpoint', target: 'entrypoint'}, ...workflow.nodes
    .map((node) => getNodeLinks(node))
    .reduce((prev, actual) => [...prev, ...actual], [])]

  return {
    nodes,
    links,
  }
}

const getNodeLinks = (node: GetVersionWorkflows_version_workflows_nodes) => (
  node.subscriptions?.map((sub) => ({ source: sub.split(".")[0], target: node.name})) || []
);

export const isNodeStarted = (node: NodeWithStatus) => {
  return node.status === NodeStatus.STARTED
}

export const isEntrypoint = (node: NodeWithStatus) => node.name === 'entrypoint';
