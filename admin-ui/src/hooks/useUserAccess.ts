import { useQuery } from '@apollo/react-hooks';
import {
  GET_ACCESS_LEVEL,
  GetAccessLevel
} from '../graphql/client/queries/getAccessLevel.graphql';
import { AccessLevel } from '../graphql/client/typeDefs';
import { get } from 'lodash';

export default function useUserAccess() {
  const { data: localData } = useQuery<GetAccessLevel>(GET_ACCESS_LEVEL);
  const accessLevel = get(localData, 'accessLevel', AccessLevel.VIEWER);
  const userHasAllAccesses = accessLevel !== AccessLevel.VIEWER;
  const cannotEdit = [AccessLevel.VIEWER, AccessLevel.MANAGER].includes(
    accessLevel
  );

  return { accessLevel, cannotEdit, userHasAllAccesses };
}
