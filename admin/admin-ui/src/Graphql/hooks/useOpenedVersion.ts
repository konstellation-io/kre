import { NodeStatus } from './../types/globalTypes';
import { openedVersion } from 'Graphql/client/cache';

function useOpenedVersion() {
  function updateEntrypointStatus(newStatus: NodeStatus) {
    openedVersion({
      ...openedVersion(),
      entrypointStatus: newStatus
    });
  }
  function updateVersion(runtimeName: string, versionName: string) {
    openedVersion({
      ...openedVersion(),
      runtimeName,
      versionName
    });
  }

  return {
    updateEntrypointStatus,
    updateVersion
  };
}

export default useOpenedVersion;
