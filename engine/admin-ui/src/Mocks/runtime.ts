import { runtime, version } from './version';

import GetRuntimeAndVersionQuery from 'Graphql/queries/getRuntimeAndVersions';

export const runtimeAndVersions = {
  runtime,
  versions: [version, version]
};
export const getRuntimeAndVersionsMock = {
  request: {
    query: GetRuntimeAndVersionQuery
  },
  result: {
    data: runtimeAndVersions
  }
};

export const getRuntimeAndVersionsErrorMock = {
  request: {
    query: GetRuntimeAndVersionQuery
  },
  error: new Error('cannot get runtime and versions')
};
