import React from 'react';
import { get } from 'lodash';
import { useParams } from 'react-router';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import StatusViewer from '../../components/StatusViewer/StatusViewer';
import { useQuery } from '@apollo/react-hooks';
import {
  GET_VERSION_WORKFLOWS,
  GetVersionWorkflowsResponse,
  GetVersionWorkflowsVars
} from './RuntimeStatusPreview.graphql';
import styles from './RuntimeStatusPreview.module.scss';

function RuntimeStatusPreview() {
  const params: { runtimeId?: string; versionId?: string } = useParams();
  const { data, loading, error } = useQuery<
    GetVersionWorkflowsResponse,
    GetVersionWorkflowsVars
  >(GET_VERSION_WORKFLOWS, {
    variables: { versionId: params.versionId }
  });

  if (error || !params.runtimeId || !params.versionId) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  const versionStatus = data && data.version && data.version.status;

  return (
    <div className={styles.container}>
      <StatusViewer
        data={get(data, 'version.workflows', [])}
        status={versionStatus}
      />
    </div>
  );
}

export default RuntimeStatusPreview;
