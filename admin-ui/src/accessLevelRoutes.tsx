import { AccessLevel } from './graphql/types/globalTypes';
import ROUTE from './constants/routes';
import { checkPermission } from './rbac-rules';

export const ruleToRoute = {
  'audit-page:visit': ROUTE.AUDIT,
  'runtime-add-page:visit': ROUTE.NEW_RUNTIME,
  'settings-page:visit': ROUTE.SETTINGS,
  'version-add-page:visit': ROUTE.NEW_VERSION,
  'version-config-page:visit': ROUTE.RUNTIME_VERSION_CONFIGURATION
};

export function getNotAllowedRoutes(accessLevel: AccessLevel) {
  const protectedRoutes: string[] = [];

  Object.entries(ruleToRoute).forEach(([rule, route]) => {
    if (!checkPermission(accessLevel, rule)) {
      protectedRoutes.push(route);
    }
  });

  return protectedRoutes;
}
