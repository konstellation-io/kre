import React, { useState } from 'react';
import { get } from 'lodash';
import { useParams } from 'react-router';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import StatusViewer from '../../components/StatusViewer/StatusViewer';
import Logs from './Logs/Logs';

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  GetVersionWorkflows,
  GetVersionWorkflowsVariables
} from '../../../../graphql/queries/types/GetVersionWorkflows';

import styles from './RuntimeStatusPreview.module.scss';
import { VersionRouteParams } from '../../../../constants/routes';

const GetVersionWorkflowsQuery = loader(
  '../../../../graphql/queries/getVersionWorkflows.graphql'
);

export type Node = {
  id: string;
  name: string;
};

type Props = {
  version: any;
};
function RuntimeStatusPreview({ version }: Props) {
  const { versionId } = useParams<VersionRouteParams>();

  const [selectedNode, setSelectedNode] = useState<Node | undefined>(undefined);

  const { data, loading, error } = useQuery<
    GetVersionWorkflows,
    GetVersionWorkflowsVariables
  >(GetVersionWorkflowsQuery, {
    variables: { versionId }
  });

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  // const versionStatus = data && data.version && data.version.status;
  const versionStatus = version && version.status;

  function setNode(nodeId: string, nodeName: string) {
    if (!nodeId.includes('InputNode') && !nodeId.includes('OutputNode')) {
      setSelectedNode({
        id: nodeId,
        name: nodeName
      } as Node);
    }
  }

  return (
    <div className={styles.container}>
      <StatusViewer
        data={get(data, 'version.workflows', [])}
        status={versionStatus}
        onNodeClick={setNode}
      />
      <Logs node={selectedNode} setSelectedNode={setSelectedNode} />
    </div>
  );
}

export default RuntimeStatusPreview;
