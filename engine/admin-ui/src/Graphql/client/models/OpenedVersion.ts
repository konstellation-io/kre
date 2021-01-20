import { NodeStatus } from './../../types/globalTypes';

export interface OpenedVersion {
  runtimeId: string;
  runtimeName: string;
  versionId: string;
  versionName: string;
  entrypointStatus: NodeStatus;
}
