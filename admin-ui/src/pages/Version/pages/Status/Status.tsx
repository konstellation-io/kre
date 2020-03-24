import React from 'react';
import { get } from 'lodash';
import { useParams } from 'react-router';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import StatusViewer from '../../components/StatusViewer/StatusViewer';

import { loader } from 'graphql.macro';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import {
  GetVersionWorkflows,
  GetVersionWorkflowsVariables
} from '../../../../graphql/queries/types/GetVersionWorkflows';

import styles from './Status.module.scss';
import {
  RuntimeRouteParams,
  VersionRouteParams
} from '../../../../constants/routes';
import { GetVersionConfStatus_versions } from '../../../../graphql/queries/types/GetVersionConfStatus';
import { LogPanel } from '../../../../graphql/client/typeDefs';

const GetVersionWorkflowsQuery = loader(
  '../../../../graphql/queries/getVersionWorkflows.graphql'
);

export type Node = {
  id: string;
  name: string;
};

type Props = {
  version?: GetVersionConfStatus_versions;
};

function Status({ version }: Props) {
  const { versionId } = useParams<VersionRouteParams>();

  const client = useApolloClient();
  const { runtimeId } = useParams<RuntimeRouteParams>();

  const { data, loading, error } = useQuery<
    GetVersionWorkflows,
    GetVersionWorkflowsVariables
  >(GetVersionWorkflowsQuery, {
    variables: { versionId }
  });

  function setCurrentLogPanel(input: LogPanel) {
    client.writeData({
      data: { logPanel: input }
    });
  }

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  const versionStatus = version && version.status;

  function setNode(nodeId: string, nodeName: string) {
    if (!nodeId.includes('InputNode') && !nodeId.includes('OutputNode')) {
      setCurrentLogPanel({
        runtimeId,
        nodeId,
        nodeName,
        __typename: 'logPanel'
      });
    }
  }

  return (
    <div className={styles.container}>
      <StatusViewer
        data={get(data, 'version.workflows', [])}
        status={versionStatus}
        onNodeClick={setNode}
      />
    </div>
  );
}

export default Status;
