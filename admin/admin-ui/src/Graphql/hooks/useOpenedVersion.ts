import { initialStateOpenedVersion, openedVersion } from 'Graphql/client/cache';

import { NodeStatus } from './../types/globalTypes';

type UpdateVersionParams = {
  runtimeId: string;
  runtimeName: string;
  versionId: string;
  versionName: string;
};

function useOpenedVersion() {
  function resetOpenedVersion() {
    openedVersion(initialStateOpenedVersion);
  }

  function updateEntrypointStatus(newStatus: NodeStatus) {
    openedVersion({
      ...openedVersion(),
      entrypointStatus: newStatus
    });
  }

  function updateVersion({
    runtimeId,
    runtimeName,
    versionId,
    versionName
  }: UpdateVersionParams) {
    openedVersion({
      ...openedVersion(),
      runtimeId,
      runtimeName,
      versionId,
      versionName
    });
  }

  return {
    updateEntrypointStatus,
    updateVersion,
    resetOpenedVersion
  };
}

export default useOpenedVersion;
