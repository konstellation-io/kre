import { NodeStatus } from './../../types/globalTypes';

export interface OpenedVersion {
  runtimeName: string;
  versionName: string;
  entrypointStatus: NodeStatus;
}
