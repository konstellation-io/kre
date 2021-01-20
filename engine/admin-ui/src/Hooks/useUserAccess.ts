import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetAccessLevel } from 'Graphql/queries/types/GetAccessLevel';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';

const GetAccessLevelQuery = loader('Graphql/queries/getAccessLevel.graphql');

export default function useUserAccess() {
  const { data, loading } = useQuery<GetAccessLevel>(GetAccessLevelQuery);
  const accessLevel = get(data?.me, 'accessLevel', AccessLevel.VIEWER);

  return { accessLevel, loading };
}
