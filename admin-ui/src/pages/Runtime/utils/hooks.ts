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
import {
  GET_RUNTIME_AND_VERSIONS,
  GetRuntimeAndVersionsResponse,
  GetRuntimeAndVersionsVars
} from '../Runtime.graphql';
import { VersionStatus } from '../../../graphql/models';

export enum versionActions {
  start = 'startVersion',
  stop = 'stopVersion',
  publish = 'publishVersion',
  unpublish = 'unpublishVersion'
}

export default function useVersionAction(runtimeId: string) {
  const [publishMutation, { loading: loadingM1 }] = useMutation<
    PublishVersionResponse,
    VersionActionVars
  >(PUBLISH_VERSION, {
    update(cache, updateResult) {
      // TODO: This update the previous one activated version.
      // We should remove this when multi activation feature is implemented.
      if (updateResult.data !== undefined && updateResult.data !== null) {
        const updatedVersion = updateResult.data.publishVersion;

        const cacheResult = cache.readQuery<
          GetRuntimeAndVersionsResponse,
          GetRuntimeAndVersionsVars
        >({
          query: GET_RUNTIME_AND_VERSIONS,
          variables: {
            runtimeId: runtimeId
          }
        });

        if (cacheResult !== null) {
          const { versions, runtime } = cacheResult;
          const newVersions = versions.map(v => {
            if (v.id === updatedVersion.id) return v;
            if (v.status === VersionStatus.PUBLISHED) {
              v.status = VersionStatus.STARTED;
            }
            return v;
          });

          cache.writeQuery({
            query: GET_RUNTIME_AND_VERSIONS,
            data: {
              runtime,
              versions: newVersions
            }
          });
        }
      }
    }
  });

  const [unpublishMutation, { loading: loadingM2 }] = useMutation<
    UnpublishVersionResponse,
    VersionActionVars
  >(UNPUBLISH_VERSION);
  const [startMutation, { loading: loadingM3 }] = useMutation<
    StartVersionResponse,
    VersionActionVars
  >(START_VERSION);
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
    [versionActions.publish]: publishMutation,
    [versionActions.start]: startMutation,
    [versionActions.stop]: stopMutation,
    [versionActions.unpublish]: unpublishMutation,
    getMutationVars,
    mutationLoading
  };
}
