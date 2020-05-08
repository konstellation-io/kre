import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import { GetAccessLevel } from '../graphql/queries/types/GetAccessLevel';
import { get } from 'lodash';
import { AccessLevel } from '../graphql/types/globalTypes';

const GetAccessLevelQuery = loader('../graphql/queries/getAccessLevel.graphql');

export default function useUserAccess() {
  const { data } = useQuery<GetAccessLevel>(GetAccessLevelQuery);
  const accessLevel = get(data?.me, 'accessLevel', AccessLevel.VIEWER);

  return accessLevel;
}
