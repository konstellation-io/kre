import { ApolloError, useApolloClient, useQuery } from '@apollo/client';
import {
  GetVersions,
  GetVersionsVariables
} from 'Graphql/queries/types/GetVersions';
import { useEffect, useState } from 'react';

import { GetRuntimes } from 'Graphql/queries/types/GetRuntimes';
import GetRuntimesQuery from 'Graphql/queries/getRuntimes';
import GetVersionsQuery from 'Graphql/queries/getVersions';

type Runtime = {
  id: string;
  name: string;
};
type Version = {
  id: string;
  name: string;
};
export type VersionsData = {
  runtime: Runtime;
  versions: Version[];
};

// Get all versions from all runtimes
export default function useAllVersions() {
  const [data, setData] = useState<VersionsData[] | null>(null);
  const [error, setError] = useState<ApolloError | undefined>();
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();
  const { data: runtimesData, error: runtimesError } = useQuery<GetRuntimes>(
    GetRuntimesQuery
  );

  useEffect(() => {
    if (runtimesData && !runtimesError) {
      const queries: Promise<VersionsData | null>[] = [];

      runtimesData.runtimes.forEach(({ id: runtimeId, name: runtimeName }) => {
        queries.push(
          client
            .query<GetVersions, GetVersionsVariables>({
              query: GetVersionsQuery,
              variables: { runtimeId }
            })
            .then(({ data: resData }) => ({
              runtime: {
                id: runtimeId,
                name: runtimeName
              },
              versions: resData
                ? resData.versions.map(({ id, name }) => ({
                    id,
                    name
                  }))
                : []
            }))
            .catch(err => {
              setError(err);
              return null;
            })
        );
      });

      Promise.all(queries).then(values => {
        setLoading(false);

        if (!error) setData(values.filter(v => v !== null) as VersionsData[]);
      });
    }
  }, [runtimesData, runtimesError, client, error]);

  useEffect(() => {
    setError(runtimesError);
  }, [runtimesError]);

  function getVersionId(runtimeName: string, versionName: string) {
    return (
      data
        ?.find(({ runtime }) => runtime.name === runtimeName)
        ?.versions.find(version => version.name === versionName)?.id ||
      'unknown'
    );
  }

  return { data, loading, error, getVersionId };
}
