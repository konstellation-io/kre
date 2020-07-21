import { NodeStatus } from './../../types/globalTypes';

const versionResolver = {
  entrypoint: (version: any) =>
    version.entrypoint || {
      id: 'entrypoint',
      status: NodeStatus.STOPPED,
      __typename: 'Node'
    }
};

export default versionResolver;
