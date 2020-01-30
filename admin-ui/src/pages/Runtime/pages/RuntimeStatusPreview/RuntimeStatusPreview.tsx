import React, { useState } from 'react';
import { get } from 'lodash';
import { useParams } from 'react-router';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import StatusViewer from '../../components/StatusViewer/StatusViewer';
import Logs from './Logs/Logs';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_VERSION_WORKFLOWS,
  GetVersionWorkflowsResponse,
  GetVersionWorkflowsVars
} from './RuntimeStatusPreview.graphql';
import styles from './RuntimeStatusPreview.module.scss';

type Props = {
  runtime: any;
  version: any;
};
function RuntimeStatusPreview({ runtime, version }: Props) {
  const params: { runtimeId?: string; versionId?: string } = useParams();

  const [selectedNode, setSelectedNode] = useState<string | undefined>(
    undefined
  );

  const { data, loading, error } = useQuery<
    GetVersionWorkflowsResponse,
    GetVersionWorkflowsVars
  >(GET_VERSION_WORKFLOWS, {
    variables: { versionId: params.versionId },
    // FIXME: This query is not getting updated!
    fetchPolicy: 'no-cache'
  });

  if (error || !params.runtimeId || !params.versionId) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  // const versionStatus = data && data.version && data.version.status;
  const versionStatus = version.status;

  function setNode(nodeId: string) {
    if (!nodeId.includes('InputNode') && !nodeId.includes('OutputNode')) {
      setSelectedNode(nodeId);
    }
  }

  return (
    <div className={styles.container}>
      <StatusViewer
        data={get(data, 'version.workflows', [])}
        status={versionStatus}
        onNodeClick={setNode}
      />
      <Logs
        nodeId={selectedNode}
        runtimeName={runtime && runtime.name}
        versionName={version && version.name}
        setSelectedNode={setSelectedNode}
      />
    </div>
  );
}

export default RuntimeStatusPreview;
