import ROUTE from './constants/routes';
import { AccessLevel } from './graphql/client/typeDefs';

const managerProtectedRoutes: string[] = [];
const viewerProtectedRoutes = [
  ...managerProtectedRoutes,
  ROUTE.SETTINGS,
  ROUTE.NEW_RUNTIME,
  ROUTE.NEW_VERSION,
  ROUTE.RUNTIME_VERSION_CONFIGURATION,
  ROUTE.SETTINGS,
  ROUTE.AUDIT
];

export const accessLevelToProtectedRoutes = new Map([
  [AccessLevel.VIEWER, viewerProtectedRoutes],
  [AccessLevel.MANAGER, managerProtectedRoutes],
  [AccessLevel.ADMINISTRATOR, []]
]);
