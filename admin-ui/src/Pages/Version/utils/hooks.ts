import {
  GetVersionConfStatus,
  GetVersionConfStatusVariables
} from 'Graphql/queries/types/GetVersionConfStatus';
import {
  PublishVersion,
  PublishVersionVariables
} from 'Graphql/mutations/types/PublishVersion';
import {
  StartVersion,
  StartVersionVariables
} from 'Graphql/mutations/types/StartVersion';
import {
  StopVersion,
  StopVersionVariables
} from 'Graphql/mutations/types/StopVersion';
import {
  UnpublishVersion,
  UnpublishVersionVariables
} from 'Graphql/mutations/types/UnpublishVersion';

import { VersionStatus } from 'Graphql/types/globalTypes';
import { loader } from 'graphql.macro';
import { useMutation } from '@apollo/react-hooks';

const PublishVersionMutation = loader(
  '../../../Graphql/mutations/publishVersion.graphql'
);
const UnpublishVersionMutation = loader(
  '../../../Graphql/mutations/unpublishVersion.graphql'
);
const StartVersionMutation = loader(
  '../../../Graphql/mutations/startVersion.graphql'
);
const StopVersionMutation = loader(
  '../../../Graphql/mutations/stopVersion.graphql'
);
const GetRuntimeAndVersionsQuery = loader(
  '../../../Graphql/queries/getRuntimeAndVersions.graphql'
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
    onError: () => console.error('Version could not be published'),
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
  >(UnpublishVersionMutation, {
    onError: () => console.error('Version could not be unpublished')
  });
  const [startMutation, { loading: loadingM3 }] = useMutation<
    StartVersion,
    StartVersionVariables
  >(StartVersionMutation, {
    onError: () => console.error('Version could not be started')
  });
  const [stopMutation, { loading: loadingM4 }] = useMutation<
    StopVersion,
    StopVersionVariables
  >(StopVersionMutation, {
    onError: () => console.error('Version could not be stopped')
  });

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
