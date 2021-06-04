import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetAccessLevel } from 'Graphql/queries/types/GetAccessLevel';
import { get } from 'lodash';
import { useQuery } from '@apollo/client';

import GetAccessLevelQuery from 'Graphql/queries/getAccessLevel';

export default function useUserAccess() {
  const { data, loading } = useQuery<GetAccessLevel>(GetAccessLevelQuery);
  const accessLevel = get(data?.me, 'accessLevel', AccessLevel.VIEWER);

  return { accessLevel, loading };
}
