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
  const [activateMutation, { loading: loadingM1 }] = useMutation<
    ActivateVersionResponse,
    VersionActionVars
  >(ACTIVATE_VERSION, { onCompleted: refreshPage });
  const [deactivateMutation, { loading: loadingM2 }] = useMutation<
    DeactivateVersionResponse,
    VersionActionVars
  >(DEACTIVATE_VERSION, { onCompleted: refreshPage });
  const [deployMutation, { loading: loadingM3 }] = useMutation<
    DeployVersionResponse,
    VersionActionVars
  >(DEPLOY_VERSION, { onCompleted: refreshPage });
  const [stopMutation, { loading: loadingM4 }] = useMutation<
    StopVersionResponse,
    VersionActionVars
  >(STOP_VERSION, { onCompleted: refreshPage });

  const mutationLoading = [loadingM1, loadingM2, loadingM3, loadingM4].some(
    el => el
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
    getMutationVars,
    mutationLoading
  };
}
