import { useMutation } from '@apollo/react-hooks';
import {
  PUBLISH_VERSION,
  PublishVersionResponse,
  START_VERSION,
  StartVersionResponse,
  STOP_VERSION,
  StopVersionResponse,
  UNPUBLISH_VERSION,
  UnpublishVersionResponse,
  VersionActionVars
} from '../pages/RuntimeStatusPreview/RuntimeStatusPreview.graphql';

export enum versionActions {
  start = 'startVersion',
  stop = 'stopVersion',
  publish = 'publishVersion',
  unpublish = 'unpublishVersion',
}

export default function useVersionAction() {
  const [publishMutation, { loading: loadingM1 }] = useMutation<PublishVersionResponse,
    VersionActionVars>(PUBLISH_VERSION);
  const [unpublishMutation, { loading: loadingM2 }] = useMutation<UnpublishVersionResponse,
    VersionActionVars>(UNPUBLISH_VERSION);
  const [startMutation, { loading: loadingM3 }] = useMutation<StartVersionResponse,
    VersionActionVars>(START_VERSION);
  const [stopMutation, { loading: loadingM4 }] = useMutation<StopVersionResponse,
    VersionActionVars>(STOP_VERSION);

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
    [versionActions.publish]: publishMutation,
    [versionActions.start]: startMutation,
    [versionActions.stop]: stopMutation,
    [versionActions.unpublish]: unpublishMutation,
    getMutationVars,
    mutationLoading
  };
}
