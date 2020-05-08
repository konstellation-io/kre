import { AccessLevel } from './graphql/types/globalTypes';
import { pageToRoute, checkPermission } from './rbac-rules';

export function getProtectedRoutes(accessLevel: AccessLevel) {
  const protectedRoutes: string[] = [];

  Object.entries(pageToRoute).forEach(([page, route]) => {
    if (!checkPermission(accessLevel, `${page}:visit`)) {
      protectedRoutes.push(route);
    }
  });

  return protectedRoutes;
}
