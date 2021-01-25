import { runtime, version } from './version';

import { loader } from 'graphql.macro';

const GetRuntimeAndVersionQuery = loader(
  'Graphql/queries/getRuntimeAndVersions.graphql'
);

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
