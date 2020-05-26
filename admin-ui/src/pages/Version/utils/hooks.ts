import { loader } from 'graphql.macro';
import { useMutation } from '@apollo/react-hooks';
import {
  GetVersionConfStatus,
  GetVersionConfStatusVariables
} from '../../../graphql/queries/types/GetVersionConfStatus';
import {
  StartVersion,
  StartVersionVariables
} from '../../../graphql/mutations/types/StartVersion';
import {
  StopVersion,
  StopVersionVariables
} from '../../../graphql/mutations/types/StopVersion';
import {
  UnpublishVersion,
  UnpublishVersionVariables
} from '../../../graphql/mutations/types/UnpublishVersion';
import {
  PublishVersion,
  PublishVersionVariables
} from '../../../graphql/mutations/types/PublishVersion';
import { VersionStatus } from '../../../graphql/types/globalTypes';

const PublishVersionMutation = loader(
  '../../../graphql/mutations/publishVersion.graphql'
);
const UnpublishVersionMutation = loader(
  '../../../graphql/mutations/unpublishVersion.graphql'
);
const StartVersionMutation = loader(
  '../../../graphql/mutations/startVersion.graphql'
);
const StopVersionMutation = loader(
  '../../../graphql/mutations/stopVersion.graphql'
);
const GetRuntimeAndVersionsQuery = loader(
  '../../../graphql/queries/getRuntimeAndVersions.graphql'
);

export enum versionActions {
  start = 'startVersion',
  stop = 'stopVersion',
  publish = 'publishVersion',
  unpublish = 'unpublishVersion'
}

export default function useVersionAction(runtimeId: string) {
  const [publishMutation, { loading: loadingM1 }] = useMutation<
    PublishVersion,
    PublishVersionVariables
  >(PublishVersionMutation, {
    update(cache, updateResult) {
      // TODO: This update the previous one activated version.
      // We should remove this when multi activation feature is implemented.
      if (updateResult.data !== undefined && updateResult.data !== null) {
        const updatedVersion = updateResult.data.publishVersion;

        const cacheResult = cache.readQuery<
          GetVersionConfStatus,
          GetVersionConfStatusVariables
        >({
          query: GetRuntimeAndVersionsQuery,
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
            query: GetRuntimeAndVersionsQuery,
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
    UnpublishVersion,
    UnpublishVersionVariables
  >(UnpublishVersionMutation);
  const [startMutation, { loading: loadingM3 }] = useMutation<
    StartVersion,
    StartVersionVariables
  >(StartVersionMutation);
  const [stopMutation, { loading: loadingM4 }] = useMutation<
    StopVersion,
    StopVersionVariables
  >(StopVersionMutation);

  const mutationLoading = [loadingM1, loadingM2, loadingM3, loadingM4].some(
    el => el
  );

  type MutationsVariables = {
    variables: PublishVersionVariables;
  };

  function getMutationVars(
    versionId: string,
    comment: string
  ): MutationsVariables {
    return { variables: { input: { versionId, comment } } };
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
