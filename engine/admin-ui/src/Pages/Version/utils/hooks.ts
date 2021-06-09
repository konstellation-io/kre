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

import { GetVersionConfStatus } from 'Graphql/queries/types/GetVersionConfStatus';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { cloneDeep } from 'lodash';
import { useMutation } from '@apollo/client';

import PublishVersionMutation from 'Graphql/mutations/publishVersion';
import UnpublishVersionMutation from 'Graphql/mutations/unpublishVersion';
import StartVersionMutation from 'Graphql/mutations/startVersion';
import StopVersionMutation from 'Graphql/mutations/stopVersion';
import GetRuntimeAndVersionsQuery from 'Graphql/queries/getRuntimeAndVersions';

export enum versionActions {
  start = 'startVersion',
  stop = 'stopVersion',
  publish = 'publishVersion',
  unpublish = 'unpublishVersion'
}

export default function useVersionAction() {
  const [publishMutation, { loading: loadingM1 }] = useMutation<
    PublishVersion,
    PublishVersionVariables
  >(PublishVersionMutation, {
    onError: e => console.error(`publishMutation: ${e}`),
    update(cache, updateResult) {
      // TODO: This update the previous one activated version.
      // We should remove this when multi activation feature is implemented.
      if (updateResult.data !== undefined && updateResult.data !== null) {
        const updatedVersion = updateResult.data.publishVersion;

        const cacheResult = cache.readQuery<GetVersionConfStatus>({
          query: GetRuntimeAndVersionsQuery
        });

        if (cacheResult !== null) {
          const { versions, runtime } = cacheResult;
          const newVersions = versions.map(v => {
            const newVersion = cloneDeep(v);
            if (newVersion.id === updatedVersion.id) return newVersion;

            if (newVersion.status === VersionStatus.PUBLISHED) {
              newVersion.status = VersionStatus.STARTED;
            }
            return newVersion;
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
    onError: e => console.error(`unpublishMutation: ${e}`)
  });
  const [startMutation, { loading: loadingM3 }] = useMutation<
    StartVersion,
    StartVersionVariables
  >(StartVersionMutation, {
    onError: e => console.error(`startMutation: ${e}`)
  });
  const [stopMutation, { loading: loadingM4 }] = useMutation<
    StopVersion,
    StopVersionVariables
  >(StopVersionMutation, {
    onError: e => console.error(`stopMutation: ${e}`)
  });

  const mutationLoading = [loadingM1, loadingM2, loadingM3, loadingM4].some(
    el => el
  );

  type MutationsVariables = {
    variables: PublishVersionVariables;
  };

  function getMutationVars(
    versionName: string,
    comment: string
  ): MutationsVariables {
    return { variables: { input: { versionName, comment } } };
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
