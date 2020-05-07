import ROUTE from './constants/routes';
import { AccessLevel } from './graphql/types/globalTypes';

const managerProtectedRoutes: string[] = [ROUTE.SETTINGS];
const viewerProtectedRoutes = [
  ...managerProtectedRoutes,
  ROUTE.NEW_RUNTIME,
  ROUTE.NEW_VERSION,
  ROUTE.RUNTIME_VERSION_CONFIGURATION,
  ROUTE.AUDIT
];

export const accessLevelToProtectedRoutes = new Map([
  [AccessLevel.VIEWER, viewerProtectedRoutes],
  [AccessLevel.MANAGER, managerProtectedRoutes],
  [AccessLevel.ADMINISTRATOR, []]
]);
