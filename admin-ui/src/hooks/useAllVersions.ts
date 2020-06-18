import { loader } from 'graphql.macro';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { GetRuntimes } from '../graphql/queries/types/GetRuntimes';
import {
  GetVersions,
  GetVersionsVariables
} from '../graphql/queries/types/GetVersions';
import { useState, useEffect } from 'react';
import { ApolloError } from 'apollo-client/errors/ApolloError';

const GetRuntimesQuery = loader('../graphql/queries/getRuntimes.graphql');
const GetVersionsQuery = loader('../graphql/queries/getVersions.graphql');

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
            .then(({ data: { versions } }) => ({
              runtime: {
                id: runtimeId,
                name: runtimeName
              },
              versions: versions.map(({ id, name }) => ({
                id,
                name
              }))
            }))
            .catch(error => {
              setError(error);
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

  return { data, loading, error };
}
