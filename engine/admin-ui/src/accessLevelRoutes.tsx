import { AccessLevel } from 'Graphql/types/globalTypes';
import ROUTE from 'Constants/routes';
import { checkPermission } from 'rbac-rules';

export const ruleToRoute = {
  'audit:view': [ROUTE.AUDIT],
  'runtime:edit': [ROUTE.NEW_RUNTIME],
  'settings:edit': [ROUTE.SETTINGS],
  'users:edit': [ROUTE.USERS],
  'version:edit': [ROUTE.NEW_VERSION, ROUTE.RUNTIME_VERSION_CONFIGURATION]
};

export function getNotAllowedRoutes(accessLevel: AccessLevel) {
  let protectedRoutes: string[] = [];

  Object.entries(ruleToRoute).forEach(([rule, routes]) => {
    if (!checkPermission(accessLevel, rule)) {
      protectedRoutes = protectedRoutes.concat(routes);
    }
  });

  return protectedRoutes;
}
