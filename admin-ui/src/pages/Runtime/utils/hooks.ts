import { useMutation } from '@apollo/react-hooks';
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

export enum versionActions {
  activate = 'activateVersion',
  deploy = 'deployVersion',
  stop = 'stopVersion',
  deactivate = 'deactivateVersion'
}

export default function useVersionAction() {
  const [activateMutation, { loading: loadingM1 }] = useMutation<
    ActivateVersionResponse,
    VersionActionVars
  >(ACTIVATE_VERSION);
  const [deactivateMutation, { loading: loadingM2 }] = useMutation<
    DeactivateVersionResponse,
    VersionActionVars
  >(DEACTIVATE_VERSION);
  const [deployMutation, { loading: loadingM3 }] = useMutation<
    DeployVersionResponse,
    VersionActionVars
  >(DEPLOY_VERSION);
  const [stopMutation, { loading: loadingM4 }] = useMutation<
    StopVersionResponse,
    VersionActionVars
  >(STOP_VERSION);

  const mutationLoading = [loadingM1, loadingM2, loadingM3, loadingM4].some(
    el => el
  );

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
    [versionActions.activate]: activateMutation,
    [versionActions.deploy]: deployMutation,
    [versionActions.stop]: stopMutation,
    [versionActions.deactivate]: deactivateMutation,
    getMutationVars,
    mutationLoading
  };
}
