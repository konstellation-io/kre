import { NodeStatus } from './../../types/globalTypes';
import { gql } from '@apollo/client';

export interface GetEntrypointStatus_entrypointStatus {
  entrypointStatus: NodeStatus;
}

export interface GetEntrypointStatus {
  openedVersion: GetEntrypointStatus_entrypointStatus;
}

export const GET_ENTRYPOINT_STATUS = gql`
  {
    openedVersion @client {
      entrypointStatus
    }
  }
`;
