import {
  GetVersionWorkflows,
  GetVersionWorkflowsVariables
} from 'Graphql/queries/types/GetVersionWorkflows';
import { useQuery } from '@apollo/client';

import GetVersionWorkflowsQuery from 'Graphql/queries/getVersionWorkflows';

export const NODE_NAME_ENTRYPOINT = 'Entry points';

export default function useWorkflowsAndNodes(versionName: string, runtimeId: string) {
  const { data } = useQuery<GetVersionWorkflows, GetVersionWorkflowsVariables>(
    GetVersionWorkflowsQuery,
    {
      variables: { versionName, runtimeId }
    }
  );

  const workflowsAndNodesNames: { [key: string]: string[] } = {
    '': [NODE_NAME_ENTRYPOINT]
  };
  const nodeNameToId = new Map<string, string>([
    [NODE_NAME_ENTRYPOINT, 'entrypoint']
  ]);

  data &&
    data.version.workflows.forEach(({ name: workflowName, nodes }) =>
      nodes.forEach(({ name: nodeName, id: nodeId }) => {
        nodeNameToId.set(`${workflowName}${nodeName}`, nodeId);

        if (workflowsAndNodesNames.hasOwnProperty(workflowName)) {
          workflowsAndNodesNames[workflowName].push(nodeName);
        } else {
          workflowsAndNodesNames[workflowName] = [nodeName];
        }
      })
    );

  return {
    workflowsAndNodesNames,
    nodeNameToId
  };
}
