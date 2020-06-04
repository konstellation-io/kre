const RUNTIMES = '/runtimes';
const RUNTIME = `${RUNTIMES}/:runtimeId`;
const RUNTIME_VERSIONS = `${RUNTIME}/versions`;
const RUNTIME_VERSION = `${RUNTIME_VERSIONS}/:versionId`;
const SETTINGS = '/settings';
const ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  VERIFY_EMAIL: '/verify_email',
  MAGIC_LINK: '/signin/:token',
  SETTINGS: '/settings',
  SETTINGS_GENERAL: `${SETTINGS}/general`,
  SETTINGS_SECURITY: `${SETTINGS}/security`,
  SETTINGS_USERS: `${SETTINGS}/users`,
  AUDIT: '/audit',
  LOGS: '/logs/:logTabInfo',
  RUNTIMES,
  RUNTIME,
  RUNTIME_VERSIONS,
  RUNTIME_VERSION,
  RUNTIME_VERSION_STATUS: `${RUNTIME_VERSION}/status`,
  RUNTIME_VERSION_CONFIGURATION: `${RUNTIME_VERSION}/configuration`,
  RUNTIME_VERSION_METRICS: `${RUNTIME_VERSION}/metrics`,
  RUNTIME_VERSION_DOCUMENTATION: `${RUNTIME_VERSION}/documentation`,
  NEW_RUNTIME: '/new-runtime',
  NEW_VERSION: `${RUNTIME}/new_version`
};

export interface RuntimeRouteParams {
  runtimeId: string;
}
export interface VersionRouteParams extends RuntimeRouteParams {
  versionId: string;
}

export default ROUTE;
