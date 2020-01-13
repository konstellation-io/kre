import * as PAGES from '../../../constants/routes';

import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router';
import {
  ACTIVATE_VERSION,
  DEACTIVATE_VERSION,
  DEPLOY_VERSION,
  STOP_VERSION,
  ActivateVersionResponse,
  DeactivateVersionResponse,
  DeployVersionResponse,
  StopVersionResponse,
  VersionActionVars
} from '../pages/RuntimeStatusPreview/RuntimeStatusPreview.graphql';

export enum actions {
  activate = 'activateVersion',
  deploy = 'deployVersion',
  stop = 'stopVersion',
  deactivate = 'deactivateVersion'
}

export default function useVersionAction(redirectionPath: string) {
  const history = useHistory();
  const [activateMutation] = useMutation<
    ActivateVersionResponse,
    VersionActionVars
  >(ACTIVATE_VERSION, { onCompleted: refreshPage });
  const [deactivateMutation] = useMutation<
    DeactivateVersionResponse,
    VersionActionVars
  >(DEACTIVATE_VERSION, { onCompleted: refreshPage });
  const [deployMutation] = useMutation<
    DeployVersionResponse,
    VersionActionVars
  >(DEPLOY_VERSION, { onCompleted: refreshPage });
  const [stopMutation] = useMutation<StopVersionResponse, VersionActionVars>(
    STOP_VERSION,
    { onCompleted: refreshPage }
  );

  function refreshPage() {
    history.push(PAGES.NEW_VERSION);
    history.replace(redirectionPath);
  }

  function getMutationVars(versionId: string, comment?: string) {
    const variables = {
      variables: {
        input: {
          versionId: versionId
        }
      }
    } as any;

    if (comment) {
      variables.variables.input.comment = comment;
    }

    return variables;
  }

  return {
    [actions.activate]: activateMutation,
    [actions.deploy]: deployMutation,
    [actions.stop]: stopMutation,
    [actions.deactivate]: deactivateMutation,
    getMutationVars
  };
}
