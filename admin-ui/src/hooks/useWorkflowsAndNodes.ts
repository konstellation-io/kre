import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import {
  GetVersionWorkflowsVariables,
  GetVersionWorkflows
} from '../graphql/queries/types/GetVersionWorkflows';

const GetVersionWorkflowsQuery = loader(
  '../graphql/queries/getVersionWorkflows.graphql'
);

export const NODE_NAME_ENTRYPOINT = 'Entry points';

export default function useWorkflowsAndNodes(versionId: string) {
  const { data } = useQuery<GetVersionWorkflows, GetVersionWorkflowsVariables>(
    GetVersionWorkflowsQuery,
    {
      variables: { versionId }
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
