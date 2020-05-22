import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import {
  GetVersionWorkflowsVariables,
  GetVersionWorkflows
} from '../graphql/queries/types/GetVersionWorkflows';

const GetVersionWorkflowsQuery = loader(
  '../graphql/queries/getVersionWorkflows.graphql'
);

export default function useWorkflowsAndNodes(versionId: string) {
  const { data } = useQuery<GetVersionWorkflows, GetVersionWorkflowsVariables>(
    GetVersionWorkflowsQuery,
    {
      variables: { versionId }
    }
  );

  const workflowsAndNodesNames: { [key: string]: string[] } = {};
  const nodeNameToId = new Map<string, string>();

  data?.version.workflows.forEach(({ name: workflowName, nodes }) =>
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
